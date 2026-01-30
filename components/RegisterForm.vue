<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const message = ref('')

const handleRegister = async () => {
  message.value = ''

  

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value },
    })

    message.value = res.message
    if (res.success) setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    console.error(err)
    message.value = 'Server error'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-50 p-6">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">
        Create Account
      </h2>

      <!-- Success / Error message -->
      <p 
        v-if="message" 
        :class="message.includes('success') ? 'text-green-500' : 'text-red-500'" 
        class="text-center mb-4 font-medium"
      >
        {{ message }}
      </p>

      <form @submit.prevent="handleRegister" class="space-y-5">

        <div>
          <label class="block text-sm font-semibold text-gray-600 mb-1">Name</label>
          <input 
            v-model="name" 
            type="text" 
            placeholder="John Doe" 
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-600 mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="john@example.com" 
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-600 mb-1">Password</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>

        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>

      <p class="text-center text-gray-500 text-sm mt-4">
        Already have an account? 
        <router-link to="/" class="text-blue-600 font-medium hover:underline">Login</router-link>
      </p>
      
    </div>
  </div>
</template>
