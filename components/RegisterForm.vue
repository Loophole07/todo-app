<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
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

const handleRegister = async () => {
  if (loading.value) return

  errors.value = {}
  loading.value = true

  try {
    const res = await $fetch<{ success: boolean; message: string; field?: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: {
          name: name.value,
          email: email.value,
          password: password.value,
          confirmPassword: confirmPassword.value,
        },
      }
    )

    if (!res.success) {
      if (res.field) errors.value[res.field] = res.message
      showToast(res.message, 'error')
      return
    }

    showToast(res.message, 'success')
    setTimeout(() => router.push('/'), 1500)

  } catch (err: any) {
    const msg = err?.data?.statusMessage || 'Server error, please try again'
    showToast(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">

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

    <div class="bg-white w-full max-w-md rounded-xl shadow p-6 mx-auto">
      <h1 class="text-2xl font-bold text-center mb-6">Registration Form</h1>

      <div class="space-y-3">

        <!-- Name -->
        <div>
          <input
            v-model="name"
            type="text"
            placeholder="Full Name"
            @input="delete errors.name"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring transition"
            :class="errors.name
              ? 'border-red-400 focus:ring-red-300 bg-red-50'
              : 'border-gray-300 focus:ring-blue-300'"
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1 ml-1">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            @input="delete errors.email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring transition"
            :class="errors.email
              ? 'border-red-400 focus:ring-red-300 bg-red-50'
              : 'border-gray-300 focus:ring-blue-300'"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1 ml-1">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            @input="delete errors.password"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring transition"
            :class="errors.password
              ? 'border-red-400 focus:ring-red-300 bg-red-50'
              : 'border-gray-300 focus:ring-blue-300'"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1 ml-1">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            @input="delete errors.confirmPassword"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring transition"
            :class="errors.confirmPassword
              ? 'border-red-400 focus:ring-red-300 bg-red-50'
              : 'border-gray-300 focus:ring-blue-300'"
          />
          <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1 ml-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Submit -->
        <button
          @click="handleRegister"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </button>

        <button
          @click="router.push('/')"
          class="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Go to Home
        </button>

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