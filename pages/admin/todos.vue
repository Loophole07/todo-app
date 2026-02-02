<script setup lang="ts">
import TodosTable from '~/components/TodosTable.vue'

// API types
type Todo = {
  id: number
  title: string
  description: string
  completed: boolean
  start_date: string
  due_date: string
  user_id: number
}

type TodosResponse = {
  success: boolean
  todos: Todo[]
}

// Fetch todos from API
const { data, pending, error } = await useFetch<TodosResponse>('/api/todos')

// Computed safe todos array
const todos = computed(() => data.value?.todos ?? [])
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10 relative">

    <!-- Back to Admin link -->
    <div class="absolute top-4 right-4">
      <NuxtLink 
        to="/admin" 
        class="text-blue-600 font-semibold hover:underline"
      >
        ← Back to Admin Panel
      </NuxtLink>
    </div>

    <div class="max-w-6xl mx-auto px-4">

      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Todos Panel
      </h1>

      <!-- Card container -->
      <div class="bg-white shadow rounded-xl p-6">

        <!-- Loading / Error states -->
        <div v-if="pending" class="text-center text-gray-500 py-10">
          Loading todos...
        </div>

        <div v-else-if="error" class="text-center text-red-500 py-10">
          Failed to load todos
        </div>

        <!-- Todos Table -->
        <TodosTable v-else :todos="todos" />

      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
