<script setup>
import { ref } from 'vue'
import { useTodoStore } from '~/stores/todoStore'

import TodoForm from '~/components/TodoForm.vue'
import TodoStats from '~/components/TodoStats.vue'
import Toast from '~/components/Toast.vue'

const store = useTodoStore()
const selectedTodo = ref(null)

// Login form state
const email = ref('')
const password = ref('')
const loginError = ref('')

// Handle login
const handleLogin = () => {
  loginError.value = ''
  if (!email.value || !password.value) {
    loginError.value = 'Please fill all fields'
    return
  }

  const success = store.login(email.value, password.value)
  if (!success) loginError.value = 'Invalid email or password'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10">
    <div class="max-w-md mx-auto px-4">

      <Toast />

      <!-- Show Login Form if not logged in -->
      <div v-if="!store.isLoggedIn" class="bg-white rounded-xl shadow p-6">
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-2">Login</h1>
        <p class="text-gray-500 text-sm text-center mb-4">
          Enter credentials to access your todos
        </p>

        <p v-if="loginError" class="text-red-500 text-sm mb-2 text-center">
          {{ loginError }}
        </p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <input
            v-model="email"
            type="email"
            placeholder="admin@test.com"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            v-model="password"
            type="password"
            placeholder="••••••"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p class="text-xs text-gray-400 text-center mt-4">
          Demo login → <strong>admin@test.com / 123456</strong>
        </p>
        <NuxtLink
  to="/register"
  class="block text-center mt-3 text-sm text-blue-600 hover:underline"
>
  Don't have an account? Register →
</NuxtLink>
      </div>

      <!-- Show Todo App if logged in -->
      <div v-else>
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800">
            Todo Manager
          </h1>
          <p class="text-gray-500 mt-2 text-sm">
            Add tasks and keep track of your progress
          </p>
        </div>

        <!-- Stats Card -->
        <div class="mb-6 bg-white rounded-xl shadow p-4">
          <TodoStats />
        </div>

        <!-- Add / Edit Todo -->
        <div class="bg-white rounded-xl shadow p-5 mb-4">
          <h2 class="text-lg font-semibold text-gray-700 mb-3">
            ➕ Add New Todo
          </h2>
          <TodoForm :editTodo="selectedTodo" />
        </div>

        <!-- Helper Text -->
        <p class="text-xs text-gray-500 text-center mb-4">
          Want to view, edit, or complete your tasks?
        </p>

        <!-- Manage Todos Button -->
        <NuxtLink
          to="/todos"
          class="block text-center border border-blue-600 text-blue-600 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          📋 Manage Todos →
        </NuxtLink>

        <!-- Logout Button -->
        <button
          @click="store.logout()"
          class="block w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

    </div>
  </div>
</template>
