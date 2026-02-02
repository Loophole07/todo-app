<script setup lang="ts">
import UsersTable from '~/components/UsersTable.vue'

// API types
type User = {
  id: number
  name: string
  email: string
}

type UsersResponse = {
  success: boolean
  users: User[]
}

// Fetch users from API
const { data, pending, error } = await useFetch<UsersResponse>('/api/users')

// Computed safe users array
const users = computed(() => data.value?.users ?? [])
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10 relative">

    <!-- Back to Admin link -->
    <div class="absolute top-4 right-4">
      <NuxtLink 
        to="/admin" 
        class="text-blue-600 font-semibold hover:underline"
      >
        ← Back to Admin Panel
      </NuxtLink>
    </div>

    <div class="max-w-5xl mx-auto px-4">

      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Users Panel
      </h1>

      <!-- Card container -->
      <div class="bg-white shadow rounded-xl p-6">

        <!-- Loading / Error states -->
        <div v-if="pending" class="text-center text-gray-500 py-10">
          Loading users...
        </div>

        <div v-else-if="error" class="text-center text-red-500 py-10">
          Failed to load users
        </div>

        <!-- Users Table -->
        <UsersTable v-else :users="users" />

      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
