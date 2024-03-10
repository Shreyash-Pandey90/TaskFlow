import { v4 as uuid } from 'uuid'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import boardData from '~/data/board.json'

interface BoardData {
  name: string;
  columns: Column[];
}

interface Column {
  id: string;
  name: string;
  color: string; // Add color property
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  description: string;
}

export const useBoardStore = defineStore('boardStore', () => {
  const board = useStorage<BoardData>('board', boardData)

  const getTask = computed(() => {
    return (taskId: string) => {
      for (const column of board.value.columns) {
        const task = column.tasks.find(task => task.id === taskId)
        if (task) return task
      }
    }
  })
  

  function addTask({ columnIndex, taskName }: { columnIndex: number; taskName: string }) {
    board.value.columns[columnIndex].tasks.push({
      id: uuid(),
      name: taskName,
      description: ''
    })
  }

  function deleteTask(taskId: string) {
    for (const column of board.value.columns) {
      const taskIndex = column.tasks.findIndex(task => task.id === taskId)

      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1)
        return
      }
    }
  }

  function moveTask({
    fromTaskIndex,
    toTaskIndex,
    fromColumnIndex,
    toColumnIndex
  }: {
    fromTaskIndex: number;
    toTaskIndex: number;
    fromColumnIndex: number;
    toColumnIndex: number;
  }) {
    const task = board.value.columns[fromColumnIndex].tasks.splice(
      fromTaskIndex,
      1
    )[0]

    board.value.columns[toColumnIndex].tasks.splice(toTaskIndex, 0, task)
  }

  function addColumn(columnName: string) {
    board.value.columns.push({
      id: uuid(),
      name: columnName,
      color: '#000000', // Default color
      tasks: []
    })
  }

  function deleteColumn(columnIndex: number) {
    board.value.columns.splice(columnIndex, 1)
  }

  function moveColumn({ fromColumnIndex, toColumnIndex }: { fromColumnIndex: number; toColumnIndex: number }) {
    const column = board.value.columns.splice(fromColumnIndex, 1)[0]
    board.value.columns.splice(toColumnIndex, 0, column)
  }

  // Add method to update column color
  function updateColumnColor(columnIndex: number, color: string) {
    board.value.columns[columnIndex].color = color;
  }

  return {
    board,
    getTask,
    addColumn,
    addTask,
    deleteColumn,
    deleteTask,
    moveColumn,
    moveTask,
    updateColumnColor
  }
})
