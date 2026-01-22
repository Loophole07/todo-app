import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showToast } from '~/utils/toast'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([]) 

  const addTodo = (todo) => {
    todos.value.push({
      id: Date.now(),
      completed: false,
      title: todo.title,
      startDate: todo.startDate,
      endDate: todo.endDate,
    })
    showToast('Todo added successfully!', 'success')
  }

  const updateTodo = (id, updatedTodo) => {
    const index = todos.value.findIndex(t => t.id === id)
    if (index !== -1) {
      todos.value[index] = { ...todos.value[index], ...updatedTodo }
      showToast('Todo updated successfully!', 'info')
    }
  }

  const deleteTodo = (id) => {
    todos.value = todos.value.filter(t => t.id !== id)
    showToast('Todo deleted successfully!', 'error')
  }

  const toggleTodo = (id) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }

  const totalTodos = computed(() => todos.value.length)
  const completedTodos = computed(() => todos.value.filter(t => t.completed).length)
  const pendingTodos = computed(() => totalTodos.value - completedTodos.value)

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    totalTodos,
    completedTodos,
    pendingTodos
  }
})
