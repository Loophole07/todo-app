<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)

type Toast = { id: number; message: string; type: 'success' | 'error' }
const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (message: string, type: 'success' | 'error') => {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

async function handleSubmit() {
  if (!email.value) {
    showToast('Please enter your email.', 'error')
    return
  }

  loading.value = true

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    showToast('Check your email for a reset link!', 'success')
    email.value = ''
  } catch (err: any) {
    showToast(err?.data?.message || 'Something went wrong.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">

    <!-- Toast -->
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto flex items-center gap-2 min-w-[220px]"
          :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        >
          <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>

    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">

      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div class="bg-blue-100 rounded-full p-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        </div>
      </div>

      <h1 class="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
      <p class="text-gray-500 mb-6 text-sm">No worries! Enter your email and we'll send you a reset link.</p>

      <div class="space-y-4">

        <div class="text-left">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <NuxtLink
          to="/login"
          class="block w-full py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
        >
          ← Back to Login
        </NuxtLink>

      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>