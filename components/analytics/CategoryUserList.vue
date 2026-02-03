<script setup lang="ts">
import { ref, watch, computed } from 'vue'

type User = {
  id: number
  name: string
  email: string
}

// Props
const props = defineProps<{
  category: string
}>()

// --- Data ---
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')

// --- Pagination ---
const ITEMS_PER_PAGE = 10
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.ceil(users.value.length / ITEMS_PER_PAGE)
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return users.value.slice(start, start + ITEMS_PER_PAGE)
})

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// --- Fetch users for category ---
const fetchUsers = async () => {
  if (!props.category) return

  loading.value = true
  error.value = ''
  users.value = []

  try {
    const res = await $fetch<{ success: boolean; users: User[]; message?: string }>(
      '/api/analytics/category-users',
      {
        method: 'GET',
        params: { category: props.category }
      }
    )

    if (res.success) {
      users.value = res.users
      currentPage.value = 1
    } else {
      error.value = res.message || 'Failed to fetch users'
    }
  } catch (err) {
    error.value = 'Failed to fetch users'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// --- Watch category changes ---
watch(
  () => props.category,
  () => {
    fetchUsers()
  },
  { immediate: true }
)
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 mt-4">
    
    <h2 class="text-xl font-semibold mb-4">
      Users in "{{ props.category }}" category
    </h2>

    <div v-if="loading" class="text-center text-gray-500 py-10">
      Loading users...
    </div>

    <div v-else-if="error" class="text-center text-red-500 py-10">
      {{ error }}
    </div>

    <div v-else-if="users.length === 0" class="text-center text-gray-500 py-10">
      No users found in this category.
    </div>

    <div v-else>
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b text-gray-600">
            <th class="py-3 text-left">ID</th>
            <th class="py-3 text-left">Name</th>
            <th class="py-3 text-left">Email</th>
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
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-4">
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
            :class="page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'"
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
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
