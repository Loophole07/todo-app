<script setup lang="ts">
import { ref, computed } from 'vue'

type Todo = {
  id: number
  title: string
  description: string
  completed: boolean
  start_date: string
  due_date: string
  user_id: number
}

const props = defineProps<{
  todos: Todo[]
}>()

const ITEMS_PER_PAGE = 10
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.ceil(props.todos.length / ITEMS_PER_PAGE)
)

const paginatedTodos = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return props.todos.slice(start, start + ITEMS_PER_PAGE)
})

const formatDate = (date: string) =>
  new Date(date).toISOString().split('T')[0]

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 overflow-x-auto">

    <table class="w-full text-sm">
      <thead>
        <tr class="border-b text-gray-600">
          <th class="py-3 text-left">ID</th>
          <th class="py-3 text-left">Title</th>
          <th class="py-3 text-left">Description</th>
          <th class="py-3 text-left">Status</th>
          <th class="py-3 text-left">Start</th>
          <th class="py-3 text-left">Due</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="todo in paginatedTodos"
          :key="todo.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="py-2">{{ todo.id }}</td>
          <td class="py-2 font-medium">{{ todo.title }}</td>
          <td class="py-2 text-gray-700">{{ todo.description }}</td>
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

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex justify-between items-center mt-4"
    >
      <p class="text-sm text-gray-500">
        Page {{ currentPage }} of {{ totalPages }}
      </p>

      <div class="flex gap-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          class="px-3 py-1 rounded border"
          :class="page === currentPage
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100'"
        >
          {{ page }}
        </button>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    <p
      v-if="props.todos.length === 0"
      class="text-center text-gray-500 mt-6"
    >
      No todos found
    </p>
  </div>
</template>
