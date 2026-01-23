<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Toast from '~/components/Toast.vue'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  
  if (email.value === 'admin@test.com' && password.value === '123456') {
    
    router.push('/')
  } else {
    error.value = 'Invalid email or password'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">

    <div class="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">

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
      <form @submit.prevent="handleLogin" class="space-y-4">

        <!-- Email -->
        <div>
          <label class="text-sm font-medium text-gray-600">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@test.com"
            class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="text-sm font-medium text-gray-600">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••"
            class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>

      
      
        <!-- Demo login → <strong>admin@test.com / 123456</strong> -->
      

    </div>

  </div>
</template>
