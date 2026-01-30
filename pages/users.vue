<script setup lang="ts">
import UsersTable from '~/components/UsersTable.vue'

// Define API response types
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

// Safe computed list of users
const users = computed(() => data.value?.users ?? [])
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10 relative">

    <!-- Login link at top-right -->
    <div class="absolute top-4 right-4">
      <NuxtLink 
        to="/" 
        class="text-blue-600 font-semibold hover:underline"
      >
        ← Back to Login
      </NuxtLink>
    </div>

    <div class="max-w-4xl mx-auto px-4">

      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Users Panel
      </h1>

      <!-- Loading / Error states -->
      <div v-if="pending" class="text-center text-gray-500">
        Loading users...
      </div>

      <div v-else-if="error" class="text-center text-red-500">
        Failed to load users
      </div>

      <!-- Users Table -->
      <UsersTable v-else :users="users" />

    </div>
  </div>
</template>
