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

type StatusFilter = 'all' | 'in_progress' | 'overdue' | 'completed'

const todos = ref<Todo[]>([])
const loading = ref(false)
const message = ref('')
const page = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const userId = ref<number | null>(null)
const activeStatus = ref<StatusFilter>('all')

const router = useRouter()
const route = useRoute()

const VALID_STATUSES: StatusFilter[] = ['all', 'in_progress', 'overdue', 'completed']
const queryStatus = route.query.status as string
activeStatus.value = VALID_STATUSES.includes(queryStatus as StatusFilter)
  ? (queryStatus as StatusFilter)
  : 'all'

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue',     label: 'Overdue' },
  { key: 'completed',   label: 'Completed' },
]

const fetchTodos = async () => {
  loading.value = true
  message.value = ''

  try {
    let queryString = `/api/todos?page=${page.value}&perPage=6`
    if (activeStatus.value !== 'all') {
      queryString += `&status=${activeStatus.value}`
    }

    const res = await $fetch<{
      success: boolean
      todos: Todo[]
      pagination: { totalPages: number; total: number }
      message?: string
    }>(queryString, { credentials: 'include' })

    if (!res.success) {
      message.value = res.message || 'Failed to fetch todos'
      return
    }

    todos.value = res.todos
    totalPages.value = res.pagination.totalPages
    totalCount.value = res.pagination.total
  } catch (err) {
    console.error(err)
    message.value = 'Error loading todos'
  } finally {
    loading.value = false
  }
}

const setStatus = (status: StatusFilter) => {
  activeStatus.value = status
  page.value = 1
  fetchTodos()
}

const deleteTodo = async (id: number) => {
  if (!confirm('Are you sure you want to delete this todo?')) return
  try {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE', credentials: 'include' })
    await fetchTodos()
  } catch {
    alert('Delete failed')
  }
}

const toggleComplete = async (todo: Todo) => {
  try {
    if (!userId.value) {
      const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', { credentials: 'include' })
      if (userRes.success && userRes.user) userId.value = userRes.user.id
    }
    await $fetch(`/api/todos/${todo.id}`, {
      method: 'POST',
      body: {
        title: todo.title,
        description: todo.description,
        category: todo.category,
        start_date: todo.start_date,
        due_date: todo.due_date,
        completed: !todo.completed,
        user_id: userId.value,
      },
      credentials: 'include',
    })
    await fetchTodos()
  } catch {
    alert('Update failed')
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

const isOverdue = (todo: Todo) => {
  if (todo.completed) return false
  const due = parseDate(todo.due_date)
  return due !== null && due < todayStr
}

const isInProgress = (todo: Todo) => {
  if (todo.completed) return false
  const start = parseDate(todo.start_date)
  const due = parseDate(todo.due_date)
  if (!start || !due) return false
  return start <= todayStr && due >= todayStr
}

const getCategoryEmoji = (category: string) => {
  const map: Record<string, string> = {
    study: '📚', bug: '🐞', api: '🔗', code: '💻',
    exam: '📝', health: '💖', work: '🏢', personal: '👤', shopping: '🛒',
  }
  return map[category] || '📌'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const nextPage = () => { if (page.value < totalPages.value) { page.value++; fetchTodos() } }
const prevPage = () => { if (page.value > 1) { page.value--; fetchTodos() } }

onMounted(async () => {
  const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', { credentials: 'include' })
  if (!userRes.success || !userRes.user) { router.push('/login'); return }
  userId.value = userRes.user.id
  await fetchTodos()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

    <!-- Top navbar -->
    <div class="bg-white/10 border-b border-white/10 px-6 py-4">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <h1 class="text-xl font-semibold text-white">My Tasks</h1>
        <div class="flex gap-2">
          <NuxtLink
            to="/home"
            class="text-sm px-3 py-1.5 border border-white/20 rounded text-gray-300 hover:bg-white/10 transition-colors"
          >
            ← Back
          </NuxtLink>
          <NuxtLink
            to="/todos/create"
            class="text-sm px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            + Add Task
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-6">

      <!-- Filter tabs -->
      <div class="flex gap-1 mb-5 border-b border-white/10">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          @click="setStatus(tab.key)"
          class="px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2"
          :class="activeStatus === tab.key
            ? 'border-purple-400 text-purple-300'
            : 'border-transparent text-gray-400 hover:text-gray-200'"
        >
          {{ tab.label }}
          <span
            v-if="activeStatus === tab.key && totalCount > 0"
            class="ml-1.5 text-xs bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full"
          >
            {{ totalCount }}
          </span>
        </button>
      </div>

      <!-- Error -->
      <div v-if="message" class="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded px-4 py-2">
        {{ message }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-gray-400 text-sm">
        Loading...
      </div>

      <!-- Empty state -->
      <div v-else-if="todos.length === 0" class="text-center py-16">
        <p class="text-gray-400 text-sm">
          {{
            activeStatus === 'completed'   ? 'No completed tasks yet.' :
            activeStatus === 'overdue'     ? 'No overdue tasks, great job!' :
            activeStatus === 'in_progress' ? 'No tasks in progress.' :
            'No tasks yet. Create one!'
          }}
        </p>
      </div>

      <!-- Task list -->
      <div v-else class="space-y-3 mb-6">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="bg-white/10 border rounded-lg p-4 hover:bg-white/15 transition-colors"
          :class="isOverdue(todo) ? 'border-red-500/30' : 'border-white/10'"
        >
          <div class="flex items-start gap-3">

            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="toggleComplete(todo)"
              class="mt-1 w-4 h-4 accent-purple-500 cursor-pointer flex-shrink-0"
            />

            <div class="flex-1 min-w-0">
              <!-- Title + badges -->
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span
                  class="text-sm font-medium text-white"
                  :class="{ 'line-through text-gray-500': todo.completed }"
                >
                  {{ todo.title }}
                </span>

                <span v-if="todo.completed"
                  class="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/20">
                  Done
                </span>
                <span v-else-if="isOverdue(todo)"
                  class="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/20">
                  Overdue
                </span>
                <span v-else-if="isInProgress(todo)"
                  class="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">
                  In Progress
                </span>

                <span class="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/20">
                  {{ getCategoryEmoji(todo.category) }} {{ todo.category }}
                </span>
              </div>

              <!-- Description -->
              <p v-if="todo.description" class="text-xs text-gray-400 mb-2 truncate">
                {{ todo.description }}
              </p>

              <!-- Dates + actions -->
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="text-xs" :class="isOverdue(todo) ? 'text-red-400' : 'text-gray-500'">
                  {{ formatDate(todo.start_date) }} → {{ formatDate(todo.due_date) }}
                </span>
                <div class="flex gap-3">
                  <NuxtLink
                    :to="`/todos/edit/${todo.id}`"
                    class="text-xs text-yellow-400 hover:underline"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    @click="deleteTodo(todo.id)"
                    class="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="text-sm px-3 py-1.5 border border-white/20 rounded text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span class="text-sm text-gray-400">Page {{ page }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="text-sm px-3 py-1.5 border border-white/20 rounded text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>