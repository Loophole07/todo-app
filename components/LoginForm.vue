<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const submitLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }

  loading.value = true
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    if (!res.success) {
      error.value = res.message
    } else {
      // You can store user in a store or localStorage
    //   console.log('Logged in user:', res.user)
      router.push('/') // redirect after login
    }
  } catch (err) {
    error.value = 'Login failed'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
    <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>

    <div v-if="error" class="mb-4 text-red-500 text-center">{{ error }}</div>

    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="w-full mb-3 px-3 py-2 border rounded"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="w-full mb-3 px-3 py-2 border rounded"
    />

    <button
      @click="submitLogin"
      :disabled="loading"
      class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    >
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </div>
</template>
