<script setup>
import { ref } from 'vue'
import { useTodoStore } from '~/stores/todoStore'

import TodoForm from '~/components/TodoForm.vue'
import TodoItem from '~/components/TodoItem.vue'
import Toast from '~/components/Toast.vue'

const store = useTodoStore()
const selectedTodo = ref(null)

const handleDelete = (id) => {
  const confirmed = window.confirm('Are you sure you want to delete this todo?')
  if (!confirmed) return
  store.deleteTodo(id)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10">

    <div class="max-w-6xl mx-auto px-4">

      <!-- Header -->
      <div
        class="flex justify-between items-center mb-8 bg-white rounded-xl shadow-sm px-6 py-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-800">All Todos</h1>
          <p class="text-sm text-gray-500 mt-1">
            View, edit, and manage your tasks
          </p>
        </div>

        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          ← Home
        </NuxtLink>
      </div>

      <!-- Toast -->
      <Toast />

      <!-- Edit Mode -->
      <div
        v-if="selectedTodo"
        class="max-w-md mx-auto mb-8 bg-white border border-blue-200 rounded-xl shadow p-5"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-blue-700">
            ✏️ Editing Todo
          </h2>
          <button
            @click="selectedTodo = null"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        <TodoForm :editTodo="selectedTodo" />
      </div>

      <!-- Empty State -->
      <div
        v-if="!store.todos.length && !selectedTodo"
        class="text-center mt-24"
      >
        <div class="text-7xl mb-6">📭</div>
        <h3 class="text-2xl font-semibold text-gray-600">
          No todos yet
        </h3>
        <p class="text-gray-400 mt-2">
          Head back home and add your first task
        </p>
      </div>

      <!-- Todo Grid -->
      <div v-else class="mt-4">
        <div
          class="grid gap-6
                 grid-cols-1
                 sm:grid-cols-2
                 lg:grid-cols-3"
        >
          <TodoItem
            v-for="todo in store.todos"
            :key="todo.id"
            :todo="todo"
            @edit="selectedTodo = todo"
            @delete="handleDelete(todo.id)"
            class="hover:-translate-y-1 transition"
          />
        </div>
      </div>

    </div>
  </div>
</template>
