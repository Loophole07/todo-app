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

const users   = ref<User[]>([])
const loading = ref(false)
const page    = ref(1)
const search  = ref('')

const pagination = ref<Pagination>({
  page: 1, perPage: 10, totalPages: 1, total: 0
})

// ── Toast ─────────────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; type: 'success' | 'error' }
const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Delete confirmation modal ─────────────────────────────────────────────────
const deleteModal = ref({
  show:    false,
  user:    null as User | null,
  loading: false,
})

const askDelete = (user: User) => {
  deleteModal.value = { show: true, user, loading: false }
}

const cancelDelete = () => {
  if (deleteModal.value.loading) return
  deleteModal.value = { show: false, user: null, loading: false }
}

const confirmDelete = async () => {
  const user = deleteModal.value.user
  if (!user) return
  deleteModal.value.loading = true
  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    showToast(`${user.name} deleted successfully`, 'success')
    deleteModal.value = { show: false, user: null, loading: false }
    fetchUsers()
  } catch (err: any) {
    console.error('DELETE ERROR:', err)
    showToast(err?.data?.statusMessage || 'Failed to delete user', 'error')
    deleteModal.value.loading = false
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
  searchTimeout = setTimeout(() => { page.value = 1; fetchUsers() }, 400)
}

const goToPage = (p: number) => {
  if (p >= 1 && p <= pagination.value.totalPages) { page.value = p; fetchUsers() }
}
const prevPage = () => goToPage(page.value - 1)
const nextPage = () => goToPage(page.value + 1)

const pageNumbers = computed(() =>
  Array.from({ length: pagination.value.totalPages }, (_, i) => i + 1)
)

onMounted(fetchUsers)
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 w-full">

    <!-- ── Toast container ───────────────────────────────────────────────── -->
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts" :key="toast.id"
          class="px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto flex items-center gap-2 min-w-[200px] backdrop-blur-sm"
          :class="toast.type === 'success'
            ? 'bg-emerald-500/90 border border-emerald-400/30'
            : 'bg-red-500/90 border border-red-400/30'"
        >
          <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- ── Delete confirmation modal ─────────────────────────────────────── -->
    <transition name="modal">
      <div
        v-if="deleteModal.show"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        @click.self="cancelDelete"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <!-- Card -->
        <div class="relative z-10 w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 animate-modalIn">

          <!-- Icon -->
          <div class="flex items-center justify-center w-12 h-12 bg-red-50 border border-red-100 rounded-xl mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h3 class="text-gray-800 font-bold text-center text-lg mb-1">Delete User?</h3>
          <p class="text-gray-400 text-sm text-center mb-2">You're about to permanently delete</p>

          <!-- User name pill -->
          <p class="text-gray-800 text-sm font-semibold text-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-1 truncate">
            {{ deleteModal.user?.name }}
          </p>
          <p class="text-gray-400 text-xs text-center mb-5">{{ deleteModal.user?.email }}</p>
          <p class="text-gray-400 text-xs text-center mb-5">This action cannot be undone.</p>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="cancelDelete"
              :disabled="deleteModal.loading"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleteModal.loading"
              class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <div v-if="deleteModal.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ deleteModal.loading ? 'Deleting...' : 'Yes, Delete' }}</span>
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- ── Search bar ─────────────────────────────────────────────────────── -->
    <div class="relative mb-4">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        v-model="search" @input="onSearch" type="text"
        placeholder="Search by name or email..."
        class="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder-gray-300"
      />
      <button v-if="search" @click="search = ''; page = 1; fetchUsers()"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- ── Table ──────────────────────────────────────────────────────────── -->
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
        <tr v-for="user in users" :key="user.id"
          class="border-b border-gray-50 hover:bg-gray-50 transition">
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
              <NuxtLink :to="`/admin/users/edit/${user.id}`"
                class="px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition">
                Edit
              </NuxtLink>
              <button @click="askDelete(user)"
                class="px-2 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
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
        <button @click="prevPage" :disabled="page === 1"
          class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition">
          ← Prev
        </button>
        <button v-for="num in pageNumbers" :key="num" @click="goToPage(num)"
          class="px-2 py-1 text-xs border rounded-lg transition"
          :class="num === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'">
          {{ num }}
        </button>
        <button @click="nextPage" :disabled="page === pagination.totalPages"
          class="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition">
          Next →
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Toast slide-in from right */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to   { opacity: 0; transform: translateX(40px); }

/* Modal backdrop fade */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }

/* Modal card pop-in */
@keyframes modalIn {
  0%   { opacity: 0; transform: scale(0.93) translateY(8px); }
  100% { opacity: 1; transform: scale(1)    translateY(0); }
}
.animate-modalIn { animation: modalIn 0.2s ease forwards; }
</style>