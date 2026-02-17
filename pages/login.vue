<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

type LoginResponse = {
  success: boolean
  message: string
  field?: string
  redirect?: string
  user?: {
    id: number
    name: string
    email: string
  }
}

const email = ref('')
const password = ref('')
const loading = ref(false)

const errors = ref<Record<string, string>>({})

// Toast
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

const router = useRouter()

const submitLogin = async () => {
  if (loading.value) return

  errors.value = {}
  loading.value = true

  try {
    const res = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: 'include',
    })

    if (!res.success) {
      if (res.field) errors.value[res.field] = res.message
      showToast(res.message, 'error')
      return
    }

    showToast(res.message, 'success')
    await nextTick()
    setTimeout(() => {
      window.location.href = res.redirect || '/home'
    }, 1000)

  } catch (err: any) {
    const msg = err?.data?.statusMessage || 'Login failed'
    showToast(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">

    <!-- Toast container -->
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
      <h1 class="text-3xl font-bold text-gray-800 mb-4">User Login</h1>
      <p class="text-gray-600 mb-6">Welcome back! Enter your credentials to access your todos.</p>

      <div class="space-y-4">

        <!-- Email -->
        <div class="text-left">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            @input="delete errors.email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
            :class="errors.email
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500'"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1 ml-1">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="text-left">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            @input="delete errors.password"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
            :class="errors.password
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500'"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1 ml-1">{{ errors.password }}</p>
        </div>

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

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>