<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

type Todo = {
  id: number
  title: string
  description: string
  completed: boolean
  start_date: string
  due_date: string
  user_id: number
  category?: string
}

type Pagination = {
  page: number
  perPage: number
  totalPages: number
  total: number
}

type TodosResponse = {
  success: boolean
  todos: Todo[]
  pagination?: Pagination | null
  message?: string
}

const todos = ref<Todo[]>([])
const loading = ref(false)
const category = ref('')
const page = ref(1)
const pagination = ref<Pagination>({
  page: 1,
  perPage: 10,
  totalPages: 1,
  total: 0
})

const fetchTodos = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: page.value,
      perPage: pagination.value.perPage
    }
    if (category.value) params.category = category.value
    const res = await $fetch<TodosResponse>('/api/admin/todos', { params })
    todos.value = res.todos
    if (res.pagination) pagination.value = res.pagination
  } catch (err) {
    console.error('FETCH TODOS ERROR:', err)
  } finally {
    loading.value = false
  }
}

const goToPage = (p: number) => {
  if (p >= 1 && p <= pagination.value.totalPages) {
    page.value = p
    fetchTodos()
  }
}
const prevPage = () => goToPage(page.value - 1)
const nextPage = () => goToPage(page.value + 1)

const pageNumbers = computed(() => {
  const nums: number[] = []
  for (let i = 1; i <= pagination.value.totalPages; i++) nums.push(i)
  return nums
})

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const categoryColor: Record<string, string> = {
  study:    'bg-purple-50 text-purple-600',
  bug:      'bg-red-50 text-red-500',
  api:      'bg-cyan-50 text-cyan-600',
  code:     'bg-blue-50 text-blue-600',
  exam:     'bg-orange-50 text-orange-500',
  health:   'bg-green-50 text-green-600',
  work:     'bg-indigo-50 text-indigo-600',
  personal: 'bg-pink-50 text-pink-500',
  shopping: 'bg-yellow-50 text-yellow-600',
}

// ── Deadline urgency helpers ───────────────────────────────────────────────

const todayStr = (() => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
})()

const parseDate = (raw: string | null | undefined): string | null => {
  if (!raw) return null
  const str = String(raw).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null
}

const getDaysLeft = (todo: Todo): number | null => {
  const due = parseDate(todo.due_date)
  if (!due || todo.completed) return null
  const todayMs = new Date(todayStr).getTime()
  const dueMs   = new Date(due).getTime()
  return Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24))
}

type DeadlineUrgency = 'safe' | 'moderate' | 'urgent' | 'none'

const getDeadlineUrgency = (todo: Todo): DeadlineUrgency => {
  const days = getDaysLeft(todo)
  if (days === null)              return 'none'
  if (days >= 4 && days <= 6)    return 'safe'
  if (days >= 2 && days <  4)    return 'moderate'
  if (days >= 0 && days <  2)    return 'urgent'
  if (days < 0)                  return 'urgent'
  return 'none'
}

// Due date cell text colour
const dueDateClass = (todo: Todo): string => {
  if (todo.completed) return 'text-gray-400'
  const urgency = getDeadlineUrgency(todo)
  if (urgency === 'urgent')   return 'text-red-500 font-semibold'
  if (urgency === 'moderate') return 'text-amber-500 font-semibold'
  if (urgency === 'safe')     return 'text-green-600 font-semibold'
  return 'text-gray-500'
}

// Small dot indicator next to due date
const dueDotClass = (todo: Todo): string => {
  if (todo.completed) return 'hidden'
  const urgency = getDeadlineUrgency(todo)
  if (urgency === 'urgent')   return 'inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1 mb-0.5'
  if (urgency === 'moderate') return 'inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 mb-0.5'
  if (urgency === 'safe')     return 'inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 mb-0.5'
  return 'hidden'
}

// Days-left label shown next to due date
const daysLeftLabel = (todo: Todo): string => {
  const days = getDaysLeft(todo)
  if (days === null)  return ''
  if (days < 0)       return `${Math.abs(days)}d overdue`
  if (days === 0)     return 'today'
  if (days === 1)     return '1d left'
  return `${days}d left`
}

// Status badge: also reflects upcoming
const isUpcoming = (todo: Todo): boolean => {
  if (todo.completed) return false
  const start = parseDate(todo.start_date)
  return start !== null && start > todayStr
}

const isOverdue = (todo: Todo): boolean => {
  if (todo.completed) return false
  const due = parseDate(todo.due_date)
  return due !== null && due < todayStr
}

// ─────────────────────────────────────────────────────────────────────────────

watch(category, () => {
  page.value = 1
  fetchTodos()
})

onMounted(() => fetchTodos())
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 overflow-x-auto">

    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100">
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Description</th>
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Start</th>
          <th class="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Due</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="todo in todos"
          :key="todo.id"
          class="border-b border-gray-50 hover:bg-gray-50 transition"
        >
          <td class="py-2.5">
            <span class="text-xs text-gray-300 font-mono">#{{ todo.id }}</span>
          </td>

          <td class="py-2.5">
            <span class="font-medium text-gray-800">{{ todo.title }}</span>
          </td>

          <td class="py-2.5 max-w-xs">
            <span class="text-gray-400 text-xs leading-relaxed line-clamp-2">{{ todo.description }}</span>
          </td>

          <td class="py-2.5">
            <span
              v-if="todo.category"
              class="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
              :class="categoryColor[todo.category] || 'bg-gray-100 text-gray-500'"
            >
              {{ todo.category }}
            </span>
            <span v-else class="text-gray-300 text-xs">—</span>
          </td>

          <!-- Status badge -->
          <td class="py-2.5">
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="todo.completed
                ? 'bg-green-50 text-green-600'
                : isOverdue(todo)
                  ? 'bg-red-50 text-red-500'
                  : isUpcoming(todo)
                    ? 'bg-sky-50 text-sky-500'
                    : 'bg-amber-50 text-amber-600'"
            >
              {{ todo.completed
                  ? '✓ Completed'
                  : isOverdue(todo)
                    ? '⚠ Overdue'
                    : isUpcoming(todo)
                      ? '◷ Upcoming'
                      : '● In Progress' }}
            </span>
          </td>

          <td class="py-2.5">
            <span class="text-xs text-gray-500">{{ formatDate(todo.start_date) }}</span>
          </td>

          <!-- Due date with urgency colour + dot + days-left label -->
          <td class="py-2.5">
            <div class="flex items-center gap-1.5">
              <span class="text-xs" :class="dueDateClass(todo)">
                <span :class="dueDotClass(todo)"></span>
                {{ formatDate(todo.due_date) }}
              </span>
              <span
                v-if="!todo.completed && daysLeftLabel(todo)"
                class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                :class="getDeadlineUrgency(todo) === 'urgent'
                  ? 'bg-red-50 text-red-500'
                  : getDeadlineUrgency(todo) === 'moderate'
                    ? 'bg-amber-50 text-amber-500'
                    : getDeadlineUrgency(todo) === 'safe'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-400'"
              >
                {{ daysLeftLabel(todo) }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-2 mt-6">
      <div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-400">Loading...</p>
    </div>

    <!-- Empty -->
    <p v-if="!loading && todos.length === 0" class="text-center text-gray-400 text-sm mt-6">
      No todos found
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
          class="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
        >
          ← Prev
        </button>
        <button
          v-for="num in pageNumbers"
          :key="num"
          @click="goToPage(num)"
          class="px-3 py-1 text-xs border rounded-lg transition"
          :class="num === page
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-200 hover:bg-gray-50'"
        >
          {{ num }}
        </button>
        <button
          @click="nextPage"
          :disabled="page === pagination.totalPages"
          class="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
        >
          Next →
        </button>
      </div>
    </div>

  </div>
</template>