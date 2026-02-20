<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

type Todo = {
  id: number
  title: string
  description?: string
  category: string
  start_date: string | null
  due_date: string | null
  completed: boolean
  user_id?: number
}

type StatusFilter = 'all' | 'upcoming' | 'in_progress' | 'overdue' | 'completed'

const todos            = ref<Todo[]>([])
const loading          = ref(false)
const message          = ref('')
const page             = ref(1)
const totalPages       = ref(1)
const totalCount       = ref(0)
const userId           = ref<number | null>(null)
const activeStatus     = ref<StatusFilter>('all')
const searchQuery      = ref('')
const selectedCategory = ref('')

// ── Delete confirmation modal ─────────────────────────────────────────────────
const deleteModal = ref({
  show:    false,
  todoId:  null as number | null,
  title:   '',
  loading: false,
})

const askDelete = (todo: Todo) => {
  deleteModal.value = { show: true, todoId: todo.id, title: todo.title, loading: false }
}

const cancelDelete = () => {
  if (deleteModal.value.loading) return
  deleteModal.value = { show: false, todoId: null, title: '', loading: false }
}

const confirmDelete = async () => {
  if (!deleteModal.value.todoId) return
  deleteModal.value.loading = true
  try {
    await $fetch(`/api/todos/${deleteModal.value.todoId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    showToast('Task deleted successfully', 'success')
    cancelDelete()
    await fetchTodos()
  } catch {
    showToast('Failed to delete task', 'error')
    deleteModal.value.loading = false
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Toast ─────────────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; type: 'success' | 'error' }
const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (msg: string, type: 'success' | 'error') => {
  const id = ++toastId
  toasts.value.push({ id, message: msg, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}
// ─────────────────────────────────────────────────────────────────────────────

const router = useRouter()
const route  = useRoute()

const VALID_STATUSES: StatusFilter[] = ['all', 'upcoming', 'in_progress', 'overdue', 'completed']
const queryStatus = route.query.status as string
activeStatus.value = VALID_STATUSES.includes(queryStatus as StatusFilter)
  ? (queryStatus as StatusFilter) : 'all'

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'upcoming',    label: 'Upcoming' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue',     label: 'Overdue' },
  { key: 'completed',   label: 'Completed' },
]

const CATEGORIES = [
  { value: '',         label: 'All Categories' },
  { value: 'study',    label: '📚 Study' },
  { value: 'bug',      label: '🐞 Bug' },
  { value: 'api',      label: '🔗 API' },
  { value: 'code',     label: '💻 Code' },
  { value: 'exam',     label: '📝 Exam' },
  { value: 'health',   label: '💖 Health' },
  { value: 'work',     label: '🏢 Work' },
  { value: 'personal', label: '👤 Personal' },
  { value: 'shopping', label: '🛒 Shopping' },
]

const fetchTodos = async () => {
  loading.value = true
  message.value = ''
  try {
    const params = new URLSearchParams()
    params.set('page',    String(page.value))
    params.set('perPage', '6')
    if (activeStatus.value !== 'all') params.set('status',   activeStatus.value)
    if (selectedCategory.value)       params.set('category', selectedCategory.value)
    if (searchQuery.value.trim())     params.set('search',   searchQuery.value.trim())

    const res = await $fetch<{
      success: boolean; todos: Todo[]
      pagination: { totalPages: number; total: number }; message?: string
    }>(`/api/todos?${params.toString()}`, { credentials: 'include' })

    if (!res.success) { message.value = res.message || 'Failed to fetch todos'; return }
    todos.value      = res.todos
    totalPages.value = res.pagination.totalPages
    totalCount.value = res.pagination.total
  } catch (err) {
    console.error(err)
    message.value = 'Error loading todos'
  } finally {
    loading.value = false
  }
}

const setStatus        = (status: StatusFilter) => { activeStatus.value = status; page.value = 1; fetchTodos() }
const onSearch         = () => { page.value = 1; fetchTodos() }
const onCategoryChange = () => { page.value = 1; fetchTodos() }
const clearSearch      = () => { searchQuery.value = ''; onSearch() }
const hasActiveFilters = () => searchQuery.value.trim() !== '' || selectedCategory.value !== ''

const toggleComplete = async (todo: Todo) => {
  try {
    if (!userId.value) {
      const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', { credentials: 'include' })
      if (userRes.success && userRes.user) userId.value = userRes.user.id
    }
    await $fetch(`/api/todos/${todo.id}`, {
      method: 'POST',
      body: { title: todo.title, description: todo.description, category: todo.category,
              start_date: todo.start_date, due_date: todo.due_date,
              completed: !todo.completed, user_id: userId.value },
      credentials: 'include',
    })
    showToast(todo.completed ? 'Task marked as incomplete' : 'Task completed ✓', 'success')
    await fetchTodos()
  } catch {
    showToast('Failed to update task', 'error')
  }
}

const parseDate = (raw: string | null): string | null => {
  if (!raw) return null
  const str = String(raw).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null
}

const todayStr = (() => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
})()

const isOverdue    = (t: Todo) => { if (t.completed) return false; const d = parseDate(t.due_date);   return d !== null && d < todayStr }
const isInProgress = (t: Todo) => { if (t.completed) return false; const s = parseDate(t.start_date); const d = parseDate(t.due_date); if (!s||!d) return false; return s <= todayStr && d >= todayStr }
const isUpcoming   = (t: Todo) => { if (t.completed) return false; const s = parseDate(t.start_date); return s !== null && s > todayStr }

const getDaysLeft = (todo: Todo): number | null => {
  const due = parseDate(todo.due_date)
  if (!due || todo.completed) return null
  return Math.ceil((new Date(due).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24))
}

type DeadlineUrgency = 'safe' | 'moderate' | 'urgent' | 'none'
const getDeadlineUrgency = (todo: Todo): DeadlineUrgency => {
  const days = getDaysLeft(todo)
  if (days === null) return 'none'
  if (days >= 4 && days <= 6) return 'safe'
  if (days >= 2 && days <  4) return 'moderate'
  if (days >= 0 && days <  2) return 'urgent'
  if (days < 0)               return 'urgent'
  return 'none'
}

const cardBorderClass    = (t: Todo) => { if (t.completed) return 'border-white/10'; const u = getDeadlineUrgency(t); return u==='urgent'?'border-red-500/50':u==='moderate'?'border-amber-500/50':u==='safe'?'border-green-500/50':'border-white/10' }
const accentBarClass     = (t: Todo) => { if (t.completed) return 'bg-white/10';     const u = getDeadlineUrgency(t); return u==='urgent'?'bg-red-500':u==='moderate'?'bg-amber-400':u==='safe'?'bg-green-500':'bg-transparent' }
const deadlineBadgeClass = (t: Todo) => { if (t.completed) return 'bg-gray-500/20 text-gray-400 border-gray-500/20'; const u = getDeadlineUrgency(t); return u==='urgent'?'bg-red-500/20 text-red-400 border-red-500/20':u==='moderate'?'bg-amber-500/20 text-amber-400 border-amber-500/20':u==='safe'?'bg-green-500/20 text-green-400 border-green-500/20':'bg-white/10 text-gray-400 border-white/10' }

const deadlineBadgeLabel = (todo: Todo) => {
  const days = getDaysLeft(todo)
  if (days === null) return ''
  if (days < 0)   return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

const getCategoryEmoji = (c: string) => ({ study:'📚',bug:'🐞',api:'🔗',code:'💻',exam:'📝',health:'💖',work:'🏢',personal:'👤',shopping:'🛒' } as Record<string,string>)[c] || '📌'

const formatDate = (d: string | null) => {
  if (!d) return '—'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

const nextPage = () => { if (page.value < totalPages.value) { page.value++; fetchTodos() } }
const prevPage = () => { if (page.value > 1)                { page.value--; fetchTodos() } }

onMounted(async () => {
  const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', { credentials: 'include' })
  if (!userRes.success || !userRes.user) { router.push('/login'); return }
  userId.value = userRes.user.id
  await fetchTodos()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

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
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Card -->
        <div class="relative z-10 w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 animate-modalIn">

          <!-- Trash icon -->
          <div class="flex items-center justify-center w-12 h-12 bg-red-500/15 border border-red-500/25 rounded-xl mx-auto mb-4">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h3 class="text-white font-bold text-center text-lg mb-1">Delete Task?</h3>
          <p class="text-slate-400 text-sm text-center mb-2">You're about to permanently delete</p>

          <!-- Task name pill -->
          <p class="text-white text-sm font-semibold text-center bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3 truncate">
            "{{ deleteModal.title }}"
          </p>
          <p class="text-slate-500 text-xs text-center mb-5">This action cannot be undone.</p>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              @click="cancelDelete"
              :disabled="deleteModal.loading"
              class="flex-1 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleteModal.loading"
              class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <div v-if="deleteModal.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ deleteModal.loading ? 'Deleting...' : 'Yes, Delete' }}</span>
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- ── Navbar ─────────────────────────────────────────────────────────── -->
    <div class="bg-white/10 border-b border-white/10 px-4 py-3">
      <div class="max-w-4xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">

        <div class="flex items-center justify-between sm:contents">
          <h1 class="text-base font-semibold text-white whitespace-nowrap">My Tasks</h1>
          <div class="flex gap-2 flex-shrink-0 sm:order-last">
            <NuxtLink to="/home" class="text-sm px-3 py-1.5 border border-white/20 rounded text-gray-300 hover:bg-white/10 transition-colors whitespace-nowrap">← Back</NuxtLink>
            <NuxtLink to="/todos/create" class="text-sm px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors whitespace-nowrap">+ Add</NuxtLink>
          </div>
        </div>

        <div class="flex gap-2 sm:flex-1">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search tasks..." @input="onSearch"
              class="w-full pl-9 pr-8 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-200" />
            <button v-if="searchQuery" @click="clearSearch" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <select v-model="selectedCategory" @change="onCategoryChange"
            class="py-1.5 px-2 text-sm bg-white/10 border border-white/20 rounded-lg text-gray-300 outline-none focus:border-purple-400 transition-all duration-200 cursor-pointer max-w-[130px] sm:max-w-none">
            <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value" class="bg-slate-800 text-white">{{ cat.label }}</option>
          </select>
        </div>

      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

      <!-- Filter tabs -->
      <div class="flex gap-0 sm:gap-1 mb-5 border-b border-white/10 overflow-x-auto scrollbar-hide">
        <button v-for="tab in statusTabs" :key="tab.key" @click="setStatus(tab.key)"
          class="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors -mb-px border-b-2 whitespace-nowrap flex-shrink-0"
          :class="activeStatus === tab.key ? 'border-purple-400 text-purple-300' : 'border-transparent text-gray-400 hover:text-gray-200'">
          {{ tab.label }}
          <span v-if="activeStatus === tab.key && totalCount > 0"
            class="ml-1 sm:ml-1.5 text-xs bg-purple-500/30 text-purple-300 px-1 sm:px-1.5 py-0.5 rounded-full">
            {{ totalCount }}
          </span>
        </button>
      </div>

      <!-- Deadline legend -->
      <div class="flex items-center gap-4 mb-4 flex-wrap">
        <span class="text-xs text-gray-500">Deadline:</span>
        <span class="flex items-center gap-1.5 text-xs text-green-400"><span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span> 4–6 days</span>
        <span class="flex items-center gap-1.5 text-xs text-amber-400"><span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span> 2–4 days</span>
        <span class="flex items-center gap-1.5 text-xs text-red-400"><span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span> 1–2 days</span>
      </div>

      <!-- Active filters -->
      <div v-if="hasActiveFilters()" class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="text-xs text-gray-400">Filtering by:</span>
        <span v-if="searchQuery.trim()" class="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/20">
          "{{ searchQuery.trim() }}" <button @click="clearSearch" class="hover:text-white ml-0.5">✕</button>
        </span>
        <span v-if="selectedCategory" class="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/20">
          {{ getCategoryEmoji(selectedCategory) }} {{ selectedCategory }}
          <button @click="selectedCategory = ''; onCategoryChange()" class="hover:text-white ml-0.5">✕</button>
        </span>
      </div>

      <!-- Error -->
      <div v-if="message" class="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded px-4 py-2">{{ message }}</div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">Loading...</div>

      <!-- Empty -->
      <div v-else-if="todos.length === 0" class="text-center py-16">
        <p class="text-gray-400 text-sm">
          {{ searchQuery || selectedCategory ? 'No tasks match your search.'
            : activeStatus === 'completed'   ? 'No completed tasks yet.'
            : activeStatus === 'overdue'     ? 'No overdue tasks, great job!'
            : activeStatus === 'in_progress' ? 'No tasks currently in progress.'
            : activeStatus === 'upcoming'    ? 'No upcoming tasks scheduled.'
            : 'No tasks yet. Create one!' }}
        </p>
        <button v-if="hasActiveFilters()" @click="searchQuery = ''; selectedCategory = ''; onSearch()"
          class="mt-3 text-sm text-purple-400 hover:underline">Clear filters</button>
      </div>

      <!-- Task list -->
      <div v-else class="space-y-3 mb-6">
        <div v-for="todo in todos" :key="todo.id"
          class="relative bg-white/10 border rounded-lg p-3 sm:p-4 hover:bg-white/15 transition-colors overflow-hidden"
          :class="cardBorderClass(todo)">

          <span class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" :class="accentBarClass(todo)" />

          <div class="flex items-start gap-3 pl-2">
            <input type="checkbox" :checked="todo.completed" @change="toggleComplete(todo)"
              class="mt-1 w-4 h-4 accent-purple-500 cursor-pointer flex-shrink-0" />

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                <span class="text-sm font-medium text-white" :class="{ 'line-through text-gray-500': todo.completed }">
                  {{ todo.title }}
                </span>
                <span v-if="todo.completed"     class="text-xs px-1.5 sm:px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/20">Done</span>
                <span v-else-if="isOverdue(todo)"   class="text-xs px-1.5 sm:px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/20">Overdue</span>
                <span v-else-if="isUpcoming(todo)"  class="text-xs px-1.5 sm:px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/20">Upcoming</span>
                <span v-else-if="isInProgress(todo)" class="text-xs px-1.5 sm:px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">In Progress</span>
                <span class="text-xs px-1.5 sm:px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/20">
                  {{ getCategoryEmoji(todo.category) }} {{ todo.category }}
                </span>
                <span v-if="!todo.completed && getDaysLeft(todo) !== null && getDaysLeft(todo)! <= 6"
                  class="text-xs px-1.5 sm:px-2 py-0.5 rounded-full border" :class="deadlineBadgeClass(todo)">
                  {{ deadlineBadgeLabel(todo) }}
                </span>
              </div>

              <p v-if="todo.description" class="text-xs text-gray-400 mb-2 truncate">{{ todo.description }}</p>

              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="text-xs" :class="isOverdue(todo) ? 'text-red-400' : 'text-gray-500'">
                  {{ formatDate(todo.start_date) }} → {{ formatDate(todo.due_date) }}
                </span>
                <div class="flex gap-3">
                  <NuxtLink :to="`/todos/edit/${todo.id}`" class="text-xs text-yellow-400 hover:underline">Edit</NuxtLink>
                  <button @click="askDelete(todo)" class="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
        <button @click="prevPage" :disabled="page === 1"
          class="text-sm px-3 py-1.5 border border-white/20 rounded text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
        <span class="text-sm text-gray-400">Page {{ page }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages"
          class="text-sm px-3 py-1.5 border border-white/20 rounded text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }

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