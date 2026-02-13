<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

type Todo = {
  id: number
  title: string
  description: string
  completed: boolean
  start_date: string
  due_date: string
  user_id: number
  category?: string
}

type Pagination = {
  page: number
  perPage: number
  totalPages: number
  total: number
}

type TodosResponse = {
  success: boolean
  todos: Todo[]
  pagination?: Pagination | null
  message?: string
}

// --- Reactive state ---
const todos = ref<Todo[]>([])
const loading = ref(false)
const category = ref('') // selected category
const page = ref(1)
const pagination = ref<Pagination>({
  page: 1,
  perPage: 10,
  totalPages: 1,
  total: 0
})

// --- Fetch todos ---
const fetchTodos = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: page.value,
      perPage: pagination.value.perPage
    }
    if (category.value) params.category = category.value

    const res = await $fetch<TodosResponse>('/api/admin/todos', { params })

    todos.value = res.todos
    if (res.pagination) pagination.value = res.pagination
  } catch (err) {
    console.error('FETCH TODOS ERROR 👉', err)
  } finally {
    loading.value = false
  }
}

// --- Pagination functions ---
const goToPage = (p: number) => {
  if (p >= 1 && p <= pagination.value.totalPages) {
    page.value = p
    fetchTodos()
  }
}
const prevPage = () => goToPage(page.value - 1)
const nextPage = () => goToPage(page.value + 1)

// --- Computed for page buttons ---
const pageNumbers = computed(() => {
  const nums: number[] = []
  for (let i = 1; i <= pagination.value.totalPages; i++) nums.push(i)
  return nums
})

// --- Format date ---
const formatDate = (date: string) => new Date(date).toISOString().split('T')[0]

// --- Watch for category changes ---
watch(category, () => {
  page.value = 1
  fetchTodos()
})

// --- Initial fetch ---
onMounted(() => fetchTodos())
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 overflow-x-auto">

    
    <!-- Todos Table -->
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b text-gray-600">
          <th class="py-3 text-left">ID</th>
          <th class="py-3 text-left">Title</th>
          <th class="py-3 text-left">Description</th>
          <th class="py-3 text-left">Category</th>
          <th class="py-3 text-left">Status</th>
          <th class="py-3 text-left">Start</th>
          <th class="py-3 text-left">Due</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="todo in todos"
          :key="todo.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="py-2">{{ todo.id }}</td>
          <td class="py-2 font-medium">{{ todo.title }}</td>
          <td class="py-2 text-gray-700">{{ todo.description }}</td>
          <td class="py-2 text-gray-700">{{ todo.category || '-' }}</td>
          <td class="py-2">
            <span
              class="px-2 py-1 rounded text-xs font-semibold"
              :class="todo.completed
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'"
            >
              {{ todo.completed ? 'Completed' : 'Pending' }}
            </span>
          </td>
          <td class="py-2">{{ formatDate(todo.start_date) }}</td>
          <td class="py-2">{{ formatDate(todo.due_date) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Loading state -->
    <p v-if="loading" class="text-center text-gray-500 mt-6">Loading...</p>

    <!-- Empty state -->
    <p v-if="!loading && todos.length === 0" class="text-center text-gray-500 mt-6">
      No todos found
    </p>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex justify-between items-center mt-4"
    >
      <p class="text-sm text-gray-500">
        Page {{ page }} of {{ pagination.totalPages }} (Total: {{ pagination.total }})
      </p>
      <div class="flex gap-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>

        <button
          v-for="num in pageNumbers"
          :key="num"
          @click="goToPage(num)"
          class="px-3 py-1 border rounded"
          :class="num === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'"
        >
          {{ num }}
        </button>

        <button
          @click="nextPage"
          :disabled="page === pagination.totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
