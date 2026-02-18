<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{ category: string }>()

type User = {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const totalUsers = ref(0)
const loading = ref(false)
const error = ref('')

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

watch(
  () => props.category,
  () => {
    currentPage.value = 1
    fetchUsers()
  },
  { immediate: true }
)

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchUsers()
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 w-full">

    <!-- Header -->
    <h2 class="text-sm font-semibold text-gray-700 mb-4 capitalize">
      Users in "{{ props.category }}" category
    </h2>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-2 mt-4">
      <div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-400">Loading...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="text-center py-10">
      <p class="text-gray-400 text-sm">No users found in this category</p>
    </div>

    <!-- Table -->
    <template v-else>
      <table class="w-full table-auto text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
            <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
            <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b border-gray-50 hover:bg-gray-50 transition"
          >
            <!-- ID -->
            <td class="py-1">
              <span class="text-xs text-gray-300 font-mono">#{{ user.id }}</span>
            </td>

            <!-- Name with avatar -->
            <td class="py-1">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-blue-50 text-blue-500 text-xs font-semibold flex items-center justify-center shrink-0">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-gray-800 font-medium break-words">{{ user.name }}</span>
              </div>
            </td>

            <!-- Email -->
            <td class="py-1">
              <span class="text-gray-500 break-words">{{ user.email }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-4 flex-wrap gap-2">
        <p class="text-xs text-gray-400">
          Page {{ currentPage }} of {{ totalPages }}
          <span class="text-gray-300">&middot;</span>
          {{ totalUsers }} total
        </p>
        <div class="flex gap-1 flex-wrap">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
          >
            ← Prev
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            class="px-2 py-1 text-xs border rounded-lg transition"
            :class="page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-200 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
          >
            Next →
          </button>
        </div>
      </div>
    </template>

  </div>
</template>