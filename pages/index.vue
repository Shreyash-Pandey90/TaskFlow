
<script setup>
import { useBoardStore } from '../stores/boardStore'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const boardStore = useBoardStore()
const route = useRoute()
const router = useRouter()

const newColumnName = ref('')
const isInputVisible = ref(false)

const isModalOpen = computed(() => {
  return route.name === 'index-tasks-id'
})

function addColumn() {
  if (!isInputVisible.value) {
    isInputVisible.value = true
  } else {
    if (newColumnName.value.trim() !== '') {
      boardStore.addColumn(newColumnName.value)
      newColumnName.value = ''
    }
    isInputVisible.value = false
  }
}

function closeModal() {
  router.push('/')
}
</script>

<template>
  <div class="board-wrapper ">
    <main class="board  ">
      <BoardColumn
        v-for="(column, columnIndex) in boardStore.board.columns"
        :key="column.id"
        :column="column"
        :columnIndex="columnIndex"
      />
      <UContainer class="column ">
        <button
          class=" hover: font-bold py-3 px-5 rounded-full flex items-center justify-center text xl color-gray-500"
          @click="addColumn"
        >
         <i class="i-heroicons i-heroicons-plus-solid mr-2 text-black-900 text-xlg"></i>
          New
        </button>
        <UInput
          v-show="isInputVisible"
          v-model="newColumnName"
          type="text"
          placeholder="Enter column name"
          @keyup.enter="addColumn"
          class="mt-1 border-2 "
        />
      </UContainer>
    </main>
    <div v-show="isModalOpen" class="task-bg" @click.self="closeModal">
      <NuxtPage :key="route.fullPath" />
    </div>
  </div>
</template>
