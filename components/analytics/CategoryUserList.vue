<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// --- Props ---
const props = defineProps<{ category: string }>()

// --- State ---
type User = {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const totalUsers = ref(0)
const loading = ref(false)
const error = ref('')

// --- Pagination ---
const ITEMS_PER_PAGE = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(totalUsers.value / ITEMS_PER_PAGE))

const fetchUsers = async () => {
  if (!props.category) return

  loading.value = true
  error.value = ''
  users.value = []

  try {
    const res = await $fetch<{
      success: boolean
      users: User[]
      total: number
      message?: string
    }>('/api/analytics/category-users', {
      params: {
        category: props.category,
        page: currentPage.value,
        perPage: ITEMS_PER_PAGE
      }
    })

    if (res.success) {
      users.value = res.users
      totalUsers.value = res.total
    } else {
      error.value = res.message || 'Failed to fetch users'
    }
  } catch (err) {
    console.error('CATEGORY USERS FETCH ERROR', err)
    error.value = 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

// --- Watch category changes ---
watch(
  () => props.category,
  () => {
    currentPage.value = 1
    fetchUsers()
  },
  { immediate: true }
)

// --- Pagination handlers ---
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchUsers()
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6">
    <h2 class="text-xl font-semibold mb-4">
      Users in "{{ props.category }}" category
    </h2>

    <div v-if="loading" class="text-gray-500 text-center py-10">
      Loading users...
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-10">
      {{ error }}
    </div>

    <div v-else-if="users.length === 0" class="text-gray-500 text-center py-10">
      No users found in this category.
    </div>

    <div v-else>
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b">
            <th class="py-2">ID</th>
            <th class="py-2">Name</th>
            <th class="py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
            <td class="py-2">{{ user.id }}</td>
            <td class="py-2 font-medium">{{ user.name }}</td>
            <td class="py-2 text-gray-600">{{ user.email }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-4">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>

        <div class="flex gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 border rounded',
              page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
