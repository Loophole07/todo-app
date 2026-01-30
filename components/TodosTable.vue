<script setup lang="ts">
// Remove: import { defineProps } from 'vue'

type Todo = {
  id: number
  title: string
  description: string
  completed: boolean
  start_date: string
  due_date: string
  user_id: number
}

// Props declaration
const props = defineProps<{
  todos: Todo[]
}>()
</script>

<template>
  <div class="overflow-x-auto bg-white rounded-xl shadow p-4">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Completed</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Start Date</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Due Date</th>
          <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">User ID</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="todo in props.todos" :key="todo.id">
          <td class="px-4 py-2 text-sm text-gray-600">{{ todo.id }}</td>
          <td class="px-4 py-2 text-sm text-gray-600">{{ todo.title }}</td>
          <td class="px-4 py-2 text-sm text-gray-600">{{ todo.description }}</td>
          <td class="px-4 py-2 text-sm text-gray-600">
            <span :class="todo.completed ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
              {{ todo.completed ? 'Yes' : 'No' }}
            </span>
          </td>
          <td class="px-4 py-2 text-sm text-gray-600">{{ todo.start_date }}</td>
          <td class="px-4 py-2 text-sm text-gray-600">{{ todo.due_date }}</td>
          <td class="px-4 py-2 text-sm text-gray-600">{{ todo.user_id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
