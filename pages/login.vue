<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

type LoginResponse = {
  success: boolean
  message: string
  redirect?: string
  user?: {
    id: number
    name: string
    email: string
  }
}

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

const submitLogin = async () => {
  if (loading.value) return

  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }

  loading.value = true

  try {
    const res = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value.trim().toLowerCase(),
        password: password.value,
      },
      credentials: 'include', 
    })

    if (!res.success) {
      error.value = res.message
      return
    }

    
    await nextTick()
    window.location.href = res.redirect || '/home'
    
  } catch (err) {
    console.error('LOGIN ERROR 👉', err)
    error.value = 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">User Login</h1>
      <p class="text-gray-600 mb-6">Welcome back! Enter your credentials to access your todos.</p>

      <p v-if="error" class="mb-4 text-sm text-red-500 text-center">{{ error }}</p>

      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          @click="submitLogin"
          :disabled="loading"
          class="w-full py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>

        <NuxtLink
          to="/"
          class="block w-full py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
        >
          ← Back
        </NuxtLink>
      </div>
    </div>
  </div>
</template>