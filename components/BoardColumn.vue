<script setup>
import { ref } from 'vue'
import { useBoardStore } from '../stores/boardStore'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  columnIndex: {
    type: Number,
    required: true
  }
})

const boardStore = useBoardStore()
const router = useRouter()

const editNameState = ref(false)
const showOptions = ref(false)
const newTaskName = ref('')

function addTask() {
  boardStore.addTask({
    taskName: newTaskName.value,
    columnIndex: props.columnIndex
  })
  newTaskName.value = ''
  showInputBox.value = false 
}

function deleteColumn(columnIndex) {
  boardStore.deleteColumn(columnIndex)
}

function dropItem(event, { toColumnIndex, toTaskIndex }) {
  const type = event.dataTransfer.getData('type')
  const fromColumnIndex = event.dataTransfer.getData('from-column-index')

  if (type === 'task') {
    const fromTaskIndex = event.dataTransfer.getData('from-task-index')

    boardStore.moveTask({
      fromTaskIndex,
      toTaskIndex,
      fromColumnIndex,
      toColumnIndex
    })
  } else if (type === 'column') {
    boardStore.moveColumn({
      fromColumnIndex,
      toColumnIndex
    })
  }
}

function goToTask(taskId) {
  router.push(`/tasks/${taskId}`)
}

function pickupColumn(event, fromColumnIndex) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('type', 'column')
  event.dataTransfer.setData('from-column-index', fromColumnIndex)
}

function pickupTask(event, { fromColumnIndex, fromTaskIndex }) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('type', 'task')
  event.dataTransfer.setData('from-column-index', fromColumnIndex)
  event.dataTransfer.setData('from-task-index', fromTaskIndex)
}

const showInputBox = ref(false)
function toggleInputBox() {
  showInputBox.value = !showInputBox.value
}

import { onMounted } from 'vue'

onMounted(() => {
  const colorPickerButton = document.getElementById(`colorPickerButton-${props.columnIndex}`);
  const colorPicker = document.getElementById(`colorPicker-${props.columnIndex}`);

  colorPickerButton.addEventListener('click', function() {
    colorPicker.click();
  });

  colorPicker.addEventListener('input', function() {
    const color = colorPicker.value;
    colorPickerButton.style.backgroundColor = color;
  });
});


function updateColor(color) {//this is the change done
  boardStore.updateColumnColor(props.columnIndex, color);
}



function lightenColor(color) {
  // Convert HEX color to RGB
  const [r, g, b] = color.match(/\w\w/g).map(hex => parseInt(hex, 16));

  // Adjust brightness (additive)
  const brightness = 90; // Adjust this value for lighter or darker colors
  const adjustedR = Math.min(r + brightness, 255);
  const adjustedG = Math.min(g + brightness, 255);
  const adjustedB = Math.min(b + brightness, 255);

  // Convert adjusted RGB back to HEX
  const adjustedColor = `#${adjustedR.toString(16)}${adjustedG.toString(16)}${adjustedB.toString(16)}`;

  return adjustedColor;
}

</script>


<!-------------------------------------------------------------------------------------------------------- -->
<template>
  <UContainer
    class="column border-2 w-[22vw]  "
    draggable="true"
    @dragstart.self="pickupColumn($event, columnIndex)"
    @dragenter.prevent
    @dragover.prevent
    @drop.stop="dropItem($event, { toColumnIndex: columnIndex })"
  >

    <div class="column-header  p-2 flex items-center border-2 rounded-lg  truncate">
      <div>
        <div class="flex items-center ">
          <UInput v-if="editNameState" type="text" v-model="column.name"  />
          <h2 :style="{ backgroundColor: lightenColor(column.color) }" class="p-0.5 rounded-md border-2" v-else>{{ column.name }} </h2>
          <span class="text-md text-gray pl-4 ">{{ column.tasks.length }}</span>

          <div>
 
            <div :id="`colorPickerButton-${props.columnIndex}`" class="rounded-full w-4 h-4 bg-blue-500 cursor-pointer m-2" :style="{ backgroundColor: column.color }"></div>
            <input type="color" :id="`colorPicker-${props.columnIndex}`" class="hidden" @change="updateColor($event.target.value)">
          </div>

        </div>
      </div>

      <div class="flex items-center space-x-4   ">
        <div class="relative">
          <UButton
            class="pb-4  text-black text-3xl flex items-center justify-center bg-transparent hover:bg-transparent border-none"
            @click="showOptions = !showOptions"
          >...
          </UButton>
          <ul v-if="showOptions" class="absolute right-0 mt-2 shadow-lg rounded flex bg-white-900">
            <li>
              <UButton
                icon="i-heroicons-pencil-square"
                class="block w-full   text-center px-2 py-1 bg-gray-500 hover:bg-gary-500"
                @click="editNameState = !editNameState"
              >
              </UButton>
            </li>
            <li>
              <UButton
                icon="i-heroicons-trash"
                class="block  w-full text-center px-2 py-1 bg-gray-500 hover:bg-gray-500 "
                @click="deleteColumn(columnIndex)"
              >
              </UButton>
            </li>
          </ul>
        </div class="border-none bg-transparent">
        <UButton
          class="p-1 bg-transparent text-black text-3xl flex items-center hover:bg-transparent border-none"
          @click="toggleInputBox"
        >
          +
        </UButton>
      </div>
    </div>

    <ul class="column-tasks">
      <li v-for="(task, taskIndex) in column.tasks" :key="task.id">
        <TaskView :task="task" :backgroundColor="lightenColor(column.color)" />
        <UCard
        class="mb-2 p-1 task-card border-2 w-full h-20 overflow-hidden flex items-center truncate"
        :style="{ backgroundColor: lightenColor(column.color) }"
        @click="goToTask(task.id)"
          draggable="true"
          @dragstart="
            pickupTask($event, {
              fromColumnIndex: columnIndex,
              fromTaskIndex: taskIndex
            })
          "
          @drop.stop="
            dropItem($event, {
              toColumnIndex: columnIndex,
              toTaskIndex: taskIndex
            })
          "
        >
          <strong class="truncate ">{{ task.name }}</strong>
          <p class="truncate">{{ task.description }}</p>
        </UCard>
      </li>
    </ul>

    <UInput
      v-if="showInputBox"
      v-model="newTaskName"
      type="text"
      placeholder="Create new task"
      @keyup.enter="addTask"
    />

  </UContainer>
</template>

<style scoped>

.column-tasks {
  max-height: 100%; /* Adjust as needed */
  overflow-y: auto;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
