<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)

const handleRegister = async () => {
  message.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    message.value = 'Please fill all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    message.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true

    const res = await $fetch<{ success: boolean; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: {
          name: name.value,
          email: email.value,
          password: password.value
        }
      }
    )

    message.value = res.message

    if (res.success) {
      setTimeout(() => router.push('/'), 1500)
    }
  } catch (err) {
    console.error(err)
    message.value = 'Server error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white w-full max-w-md rounded-xl shadow p-6 mx-auto mt-10">
    <h1 class="text-2xl font-bold text-center mb-6">
      Registration Form
    </h1>

    <input
      v-model="name"
      type="text"
      placeholder="Full Name"
      class="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
    />

    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
    />

    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
    />

    <input
      v-model="confirmPassword"
      type="password"
      placeholder="Confirm Password"
      class="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
    />

    <!-- Register button -->
    <button
      @click="handleRegister"
      :disabled="loading"
      class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ loading ? 'Registering...' : 'Register' }}
    </button>

    <!-- Go to Index button -->
    <button
      @click="router.push('/')"
      class="w-full mt-3 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
    >
      Go to Home
    </button>

    <p v-if="message" class="text-center mt-4 text-sm text-red-500">
      {{ message }}
    </p>
  </div>
</template>

