<script setup lang="ts">
import { ref, computed } from 'vue'

type User = {
  id: number
  name: string
  email: string
}

const props = defineProps<{
  users: User[]
}>()

const ITEMS_PER_PAGE = 10
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.ceil(props.users.length / ITEMS_PER_PAGE)
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return props.users.slice(start, start + ITEMS_PER_PAGE)
})

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Edit button handler
const handleEdit = (user: User) => {
  alert(`Edit user: ${user.name} (${user.email})`)
}

const handleDelete = (user: User) => {
  const confirmed = confirm(`Are you sure you want to delete ${user.name}?`)
  if (confirmed) {
    alert(`Deleted user: ${user.name}`)
   
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6">

    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b text-gray-600">
          <th class="py-3 text-left">ID</th>
          <th class="py-3 text-left">Name</th>
          <th class="py-3 text-left">Email</th>
          <th class="py-3 text-left">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="user in paginatedUsers"
          :key="user.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="py-2">{{ user.id }}</td>
          <td class="py-2 font-medium">{{ user.name }}</td>
          <td class="py-2 text-gray-600">{{ user.email }}</td>
          <td class="py-2 flex gap-2">
            <button
              @click="handleEdit(user)"
              class="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            >
              Edit
            </button>
            <button
              @click="handleDelete(user)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex justify-between items-center mt-4"
    >
      <p class="text-sm text-gray-500">
        Page {{ currentPage }} of {{ totalPages }}
      </p>

      <div class="flex gap-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          class="px-3 py-1 rounded border"
          :class="page === currentPage
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100'"
        >
          {{ page }}
        </button>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    <p
      v-if="props.users.length === 0"
      class="text-center text-gray-500 mt-6"
    >
      No users found
    </p>
  </div>
</template>
