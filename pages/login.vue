<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Toast from '~/components/Toast.vue'
import UsersTable from '~/components/UsersTable.vue'

const router = useRouter()

// Login form state
const email = ref('')
const password = ref('')
const error = ref('')

// Logged in state
const isLoggedIn = ref(false)

// Users state
type User = { id: number; name: string; email: string }
const users = ref<User[]>([])
const loadingUsers = ref(false)
const usersError = ref('')

// Handle login
const handleLogin = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  // Simple admin check
  if (email.value === 'admin@test.com' && password.value === '123456') {
    isLoggedIn.value = true
    email.value = ''
    password.value = ''

    // Fetch users from API
    loadingUsers.value = true
    usersError.value = ''
    try {
      const res = await $fetch<{ success: boolean; users: User[] }>('/api/users')
      if (res.success) {
        users.value = res.users
      } else {
        usersError.value = 'Failed to fetch users'
      }
    } catch (e) {
      usersError.value = 'Failed to fetch users'
      console.error(e)
    } finally {
      loadingUsers.value = false
    }

  } else {
    error.value = 'Invalid email or password'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">

    <div class="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 mb-6">

      <!-- Title -->
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-2">
        Welcome Back 👋
      </h1>
      <p class="text-center text-gray-500 text-sm mb-6">
        Login to manage your todos
      </p>

      <Toast />

      <!-- Error -->
      <p v-if="error" class="text-red-500 text-sm mb-3 text-center">
        {{ error }}
      </p>

      <!-- Form -->
      <form v-if="!isLoggedIn" @submit.prevent="handleLogin" class="space-y-4">

        <div>
          <label class="text-sm font-medium text-gray-600">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@test.com"
            class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••"
            class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>

    </div>

    <!-- Users Display Panel (after login) -->
    <div v-if="isLoggedIn" class="w-full max-w-4xl px-4">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 text-center">Registered Users</h2>

      <div v-if="loadingUsers" class="text-center text-gray-500 mb-4">
        Loading users...
      </div>
      <div v-else-if="usersError" class="text-center text-red-500 mb-4">
        {{ usersError }}
      </div>
      <div v-else>
        <UsersTable :users="users" />
      </div>
    </div>
    
 
  </div>
 
</template>
