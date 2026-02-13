<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Todo = {
  id: number
  title: string
  description?: string
  category: string
  start_date: string
  due_date: string
  completed: boolean
}

const todos = ref<Todo[]>([])
const loading = ref(false)
const message = ref('')
const page = ref(1)
const totalPages = ref(1)

const fetchTodos = async () => {
  loading.value = true
  message.value = ''

  try {
    const res = await $fetch<{
      success: boolean
      todos: Todo[]
      pagination: { totalPages: number }
      message?: string
    }>('/api/todos?page=' + page.value)

    if (!res.success) {
      message.value = res.message || 'Failed to fetch todos'
      return
    }

    todos.value = res.todos
    totalPages.value = res.pagination.totalPages

  } catch (err) {
    console.error(err)
    message.value = 'Error loading todos'
  } finally {
    loading.value = false
  }
}

const deleteTodo = async (id: number) => {
  if (!confirm('Delete this todo?')) return

  try {
    const res = await $fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    })

    await fetchTodos()
  } catch (err) {
    alert('Delete failed')
  }
}

const toggleComplete = async (todo: Todo) => {
  try {
    await $fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: { completed: !todo.completed }
    })
    await fetchTodos()
  } catch (err) {
    alert('Update failed')
  }
}

onMounted(fetchTodos)
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">

      <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 class="text-2xl font-bold">My Todos</h1>
        
        <div class="flex gap-3">
          <NuxtLink 
            to="/home" 
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </NuxtLink>
          
          <NuxtLink 
            to="/todos/create" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Todo
          </NuxtLink>
        </div>
      </div>
      

      <p v-if="message" class="text-red-500 mb-4">{{ message }}</p>

      <div v-if="loading" class="text-gray-500">Loading...</div>

      <div v-else-if="todos.length === 0" class="text-gray-500">
        No todos found
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="border rounded-lg p-4 flex justify-between items-start"
        >
          <div>
            <h2 class="font-semibold text-lg"
                :class="{ 'line-through text-gray-400': todo.completed }">
              {{ todo.title }}
            </h2>

            <p class="text-sm text-gray-500">{{ todo.description }}</p>

            <div class="text-xs text-gray-400 mt-1">
              {{ todo.category }} |
              {{ todo.start_date }} → {{ todo.due_date }}
            </div>
          </div>

          <div class="flex flex-col gap-2 items-end">
            <button
              @click="toggleComplete(todo)"
              class="text-sm px-3 py-1 rounded bg-green-500 text-white"
            >
              {{ todo.completed ? 'Undo' : 'Done' }}
            </button>

            <NuxtLink
              :to="`/todos/edit/${todo.id}`"
              class="text-sm px-3 py-1 rounded bg-yellow-500 text-white"
            >
              Edit
            </NuxtLink>

            <button
              @click="deleteTodo(todo.id)"
              class="text-sm px-3 py-1 rounded bg-red-500 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-4 mt-6" v-if="totalPages > 1">
        <button
          @click="page--; fetchTodos()"
          :disabled="page === 1"
          class="px-4 py-2 border rounded"
        >
          Prev
        </button>

        <span>Page {{ page }} / {{ totalPages }}</span>

        <button
          @click="page++; fetchTodos()"
          :disabled="page === totalPages"
          class="px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>

    </div>
  </div>
</template>
