<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type User = { id: number; name: string; email: string }

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const name = ref('')
const email = ref('')
const loading = ref(false)
const message = ref('')

/* Fetch single user */
const fetchUser = async () => {
  try {
    const res = await $fetch<{ success: boolean; user?: User }>(
      `/api/admin/users/${id}`
    )
    if (res.success && res.user) {
      name.value = res.user.name
      email.value = res.user.email
    } else {
      message.value = 'User not found'
    }
  } catch (err) {
    console.error('FETCH USER ERROR ', err)
    message.value = 'Failed to fetch user'
  }
}

/* Update user */
const updateUser = async () => {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${id}`,
      {
        method: 'PUT',
        body: { name: name.value, email: email.value }
      }
    )

    if (res.success) {
      alert('User updated')
      router.push('/admin/users')
    } else {
      alert(res.message || 'Failed to update user')
    }
  } catch (err) {
    console.error('UPDATE USER ERROR 👉', err)
    alert('Failed to update user')
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">
    <h2 class="text-2xl font-bold mb-4 text-center">Edit User</h2>
    <p v-if="message" class="text-red-500 text-center mb-2">{{ message }}</p>

    <div class="space-y-3">
      <input v-model="name" type="text" placeholder="Name" class="w-full border px-3 py-2 rounded-lg" />
      <input v-model="email" type="email" placeholder="Email" class="w-full border px-3 py-2 rounded-lg" />

      <button @click="updateUser" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        {{ loading ? 'Updating…' : 'Update User' }}
      </button>

      <NuxtLink to="/admin" class="block text-center mt-2 text-gray-600 hover:underline">
        ← Back to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>
