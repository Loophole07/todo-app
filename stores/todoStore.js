import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  const isLoggedIn = ref(false) // <-- track login

  const addTodo = (todo) => {
    todos.value.push({ id: Date.now(), ...todo, completed: false })
  }

  const updateTodo = (id, updated) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) Object.assign(todo, updated)
  }

  const deleteTodo = (id) => {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  const toggleTodo = (id) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }

  const totalTodos = computed(() => todos.value.length)
  const completedTodos = computed(() => todos.value.filter(t => t.completed).length)
  const pendingTodos = computed(() => totalTodos.value - completedTodos.value)

  const login = (email, password) => {
    if (email === 'admin@test.com' && password === '123456') {
      isLoggedIn.value = true
      return true
    }
    return false
  }

  const logout = () => {
    isLoggedIn.value = false
  }

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    totalTodos,
    completedTodos,
    pendingTodos,
    isLoggedIn,
    login,
    logout
  }
})
