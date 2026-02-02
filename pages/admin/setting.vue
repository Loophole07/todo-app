<template>
  <div class="max-w-lg mx-auto bg-white p-6 rounded shadow space-y-6">
    <h2 class="text-2xl font-bold mb-4">Admin Settings</h2>

    <form class="space-y-4">
      <div>
        <label class="block mb-1 font-medium">Username</label>
        <input type="text" v-model="username" class="w-full border p-2 rounded" />
      </div>

      <div>
        <label class="block mb-1 font-medium">Email</label>
        <input type="email" v-model="email" class="w-full border p-2 rounded" />
      </div>

      <div>
        <label class="block mb-1 font-medium">Password</label>
        <input type="password" v-model="password" class="w-full border p-2 rounded" />
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" @click="resetForm">
          Reset
        </button>
        <button type="button" class="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600" @click="saveSettings">
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('Admin')
const email = ref('admin@example.com')
const password = ref('')

const resetForm = () => {
  username.value = 'Admin'
  email.value = 'admin@example.com'
  password.value = ''
}

const saveSettings = () => {
  alert(`Saved settings:\nUsername: ${username.value}\nEmail: ${email.value}`)
}
</script>
