<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

type User = { id: number; name: string; email: string }

type Pagination = {
  page: number
  perPage: number
  totalPages: number
  total: number
}

type UsersResponse = {
  success: boolean
  users: User[]
  pagination?: Pagination | null
}

const router = useRouter()

const users = ref<User[]>([])
const loading = ref(false)
const page = ref(1)
const search = ref('')

const pagination = ref<Pagination>({
  page: 1,
  perPage: 10,
  totalPages: 1,
  total: 0
})


const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}


const confirmDialog = ref<{ show: boolean; user: User | null }>({
  show: false,
  user: null
})

const askDelete = (user: User) => {
  confirmDialog.value = { show: true, user }
}

const cancelDelete = () => {
  confirmDialog.value = { show: false, user: null }
}


const fetchUsers = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: page.value,
      perPage: pagination.value.perPage
    }
    if (search.value.trim()) params.search = search.value.trim()

    const res = await $fetch<UsersResponse>('/api/admin/users', { params })
    users.value = res.users
    if (res.pagination) pagination.value = res.pagination
  } catch (err) {
    console.error('FETCH USERS ERROR:', err)
    showToast('Failed to fetch users', 'error')
  } finally {
    loading.value = false
  }
}


let searchTimeout: ReturnType<typeof setTimeout>
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 400)
}


const goToPage = (p: number) => {
  if (p >= 1 && p <= pagination.value.totalPages) {
    page.value = p
    fetchUsers()
  }
}

const prevPage = () => goToPage(page.value - 1)
const nextPage = () => goToPage(page.value + 1)

const pageNumbers = computed(() =>
  Array.from({ length: pagination.value.totalPages }, (_, i) => i + 1)
)


const handleDelete = async () => {
  const user = confirmDialog.value.user
  if (!user) return
  cancelDelete()
  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    showToast(`${user.name} deleted successfully`, 'success')
    fetchUsers()
  } catch (err: any) {
    console.error('DELETE ERROR:', err)
    showToast(err?.data?.statusMessage || 'Failed to delete user', 'error')
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 w-full">

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast"
        :class="[
          'fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2',
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        ]"
      >
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Confirm Dialog -->
    <transition name="fade">
      <div
        v-if="confirmDialog.show"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="bg-red-50 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-800">Delete User</h3>
          </div>
          <p class="text-sm text-gray-500">
            Are you sure you want to delete
            <span class="font-semibold text-gray-800">{{ confirmDialog.user?.name }}</span>?
            This action cannot be undone.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="cancelDelete"
              class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Search Bar -->
    <div class="relative mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        v-model="search"
        @input="onSearch"
        type="text"
        placeholder="Search by name or email..."
        class="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder-gray-300"
      />
      <button
        v-if="search"
        @click="search = ''; page = 1; fetchUsers()"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Table -->
    <table class="w-full table-auto text-sm">
      <thead>
        <tr class="border-b border-gray-100">
          <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
          <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
          <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
          <th class="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          class="border-b border-gray-50 hover:bg-gray-50 transition"
        >
          <td class="py-1">
            <span class="text-xs text-gray-300 font-mono">#{{ user.id }}</span>
          </td>
          <td class="py-1">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-blue-50 text-blue-500 text-xs font-semibold flex items-center justify-center shrink-0">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-gray-800 font-medium break-words">{{ user.name }}</span>
            </div>
          </td>
          <td class="py-1">
            <span class="text-gray-500 break-words">{{ user.email }}</span>
          </td>
          <td class="py-1">
            <div class="flex gap-2 flex-wrap">
              <NuxtLink
                :to="`/admin/users/edit/${user.id}`"
                class="px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
              >
                Edit
              </NuxtLink>
              <button
                @click="askDelete(user)"
                class="px-2 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-2 mt-4">
      <div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-400">Loading...</p>
    </div>

    <!-- Empty -->
    <p v-if="!loading && users.length === 0" class="text-center text-gray-400 text-sm mt-4">
      {{ search ? `No users found for "${search}"` : 'No users found' }}
    </p>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-between items-center mt-4 flex-wrap gap-2">
      <p class="text-xs text-gray-400">
        Page {{ page }} of {{ pagination.totalPages }}
        <span class="text-gray-300">&middot;</span>
        {{ pagination.total }} total
      </p>
      <div class="flex gap-1 flex-wrap">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
        >
          ← Prev
        </button>
        <button
          v-for="num in pageNumbers"
          :key="num"
          @click="goToPage(num)"
          class="px-2 py-1 text-xs border rounded-lg transition"
          :class="num === page
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-200 hover:bg-gray-50'"
        >
          {{ num }}
        </button>
        <button
          @click="nextPage"
          :disabled="page === pagination.totalPages"
          class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>