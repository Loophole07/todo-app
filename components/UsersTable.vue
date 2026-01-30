<script setup lang="ts">
defineProps<{
  users: {
    id: number
    name: string
    email: string
  }[]
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">
      👥 Registered Users
    </h2>

    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b text-left text-gray-600">
          <th class="py-2">ID</th>
          <th class="py-2">Name</th>
          <th class="py-2">Email</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="py-2">{{ user.id }}</td>
          <td class="py-2">{{ user.name }}</td>
          <td class="py-2">{{ user.email }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="users.length === 0" class="text-center text-gray-500 mt-4">
      No users found
    </p>
  </div>
</template>
