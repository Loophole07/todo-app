<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- Form state ---
const email = ref('')
const password = ref('')
const message = ref('')
const loading = ref(false)

const handleAdminLogin = async () => {
  message.value = ''

  if (!email.value || !password.value) {
    message.value = 'Please fill all fields'
    return
  }

  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string; admin?: any }>('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    message.value = res.message

    if (res.success) {
      // Redirect to admin dashboard
      router.push('/admin')
    }
  } catch (err) {
    console.error(err)
    message.value = 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-gray-200 to-blue-200">
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Admin Login</h1>
      <p class="text-gray-600 mb-6">Access the admin dashboard by logging in below.</p>

      <p v-if="message" class="mb-4 text-sm text-red-500 text-center">{{ message }}</p>

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
          @click="handleAdminLogin"
          :disabled="loading"
          class="w-full py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
