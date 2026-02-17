<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const title = ref('')
const description = ref('')
const category = ref('')
const start_date = ref('')
const due_date = ref('')
const completed = ref(false)
const loading = ref(false)
const loadingTodo = ref(true)
const userId = ref<number | null>(null)

const errors = ref<Record<string, string>>({})

// Toast
type Toast = { id: number; message: string; type: 'success' | 'error' }
const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (message: string, type: 'success' | 'error') => {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

const router = useRouter()
const route = useRoute()

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  const str = String(dateString).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : ''
}

onMounted(async () => {
  try {
    const todoId = Number(route.params.id)

    if (!todoId || isNaN(todoId)) {
      showToast('Invalid todo ID', 'error')
      setTimeout(() => router.push('/todos'), 1500)
      return
    }

    const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', {
      credentials: 'include'
    })

    if (!userRes.success || !userRes.user) {
      showToast('You must be logged in!', 'error')
      setTimeout(() => router.push('/login'), 1500)
      return
    }

    userId.value = userRes.user.id

    const todoRes = await $fetch<{ success: boolean; todo?: any }>(`/api/todos/${todoId}`, {
      credentials: 'include'
    })

    if (!todoRes.success || !todoRes.todo) {
      showToast('Todo not found!', 'error')
      setTimeout(() => router.push('/todos'), 1500)
      return
    }

    const todo = todoRes.todo
    title.value = todo.title || ''
    description.value = todo.description || ''
    category.value = todo.category || ''
    completed.value = todo.completed || false
    start_date.value = formatDateForInput(todo.start_date)
    due_date.value = formatDateForInput(todo.due_date)

  } catch (err) {
    console.error('Failed to load todo', err)
    showToast('Failed to load todo', 'error')
    setTimeout(() => router.push('/todos'), 1500)
  } finally {
    loadingTodo.value = false
  }
})

const updateTodo = async () => {
  if (loading.value || !userId.value) return

  errors.value = {}
  const todoId = Number(route.params.id)
  loading.value = true

  try {
    const res = await $fetch<{ success: boolean; message: string; field?: string }>(`/api/todos/${todoId}`, {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value,
        category: category.value,
        start_date: start_date.value,
        due_date: due_date.value,
        completed: completed.value,
        user_id: userId.value
      },
      credentials: 'include'
    })

    if (!res.success) {
      if (res.field) errors.value[res.field] = res.message
      showToast(res.message, 'error')
      return
    }

    showToast('Todo updated successfully!', 'success')
    setTimeout(() => router.push('/todos'), 1200)

  } catch (err: any) {
    const msg = err?.data?.statusMessage || 'Failed to update todo'
    showToast(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 px-4">

    <!-- Toast container -->
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto flex items-center gap-2 min-w-[220px]"
          :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        >
          <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- Loading State -->
    <div v-if="loadingTodo" class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-700">Loading todo...</p>
    </div>

    <!-- Edit Form -->
    <div v-else class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-800 tracking-wide">Edit Todo</h2>

      <div class="space-y-4">

        <!-- Title -->
        <div>
          <input
            v-model="title"
            placeholder="Title"
            @input="delete errors.title"
            class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 shadow-sm placeholder-gray-400 transition"
            :class="errors.title
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-400'"
          />
          <p v-if="errors.title" class="text-red-500 text-xs mt-1 ml-1">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div>
          <textarea
            v-model="description"
            placeholder="Description"
            rows="3"
            @input="delete errors.description"
            class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 shadow-sm placeholder-gray-400 transition"
            :class="errors.description
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-400'"
          ></textarea>
          <p v-if="errors.description" class="text-red-500 text-xs mt-1 ml-1">{{ errors.description }}</p>
        </div>

        <!-- Category -->
        <div>
          <select
            v-model="category"
            @change="delete errors.category"
            class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 shadow-sm transition"
            :class="errors.category
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-400'"
          >
            <option value="" disabled>Select Category</option>
            <option value="study">📚 Study</option>
            <option value="bug">🐞 Bug</option>
            <option value="api">🔗 API</option>
            <option value="code">💻 Code</option>
            <option value="exam">📝 Exam</option>
            <option value="health">💖 Health</option>
            <option value="work">🏢 Work</option>
            <option value="personal">👤 Personal</option>
            <option value="shopping">🛒 Shopping</option>
          </select>
          <p v-if="errors.category" class="text-red-500 text-xs mt-1 ml-1">{{ errors.category }}</p>
        </div>

        <!-- Start date -->
        <div>
          <label class="font-medium text-gray-700 text-sm">Starting Date:</label>
          <input
            type="date"
            v-model="start_date"
            @change="delete errors.start_date"
            class="w-full mt-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 shadow-sm transition"
            :class="errors.start_date
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-400'"
          />
          <p v-if="errors.start_date" class="text-red-500 text-xs mt-1 ml-1">{{ errors.start_date }}</p>
        </div>

        <!-- Due date -->
        <div>
          <label class="font-medium text-gray-700 text-sm">Ending Date:</label>
          <input
            type="date"
            v-model="due_date"
            @change="delete errors.due_date"
            class="w-full mt-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 shadow-sm transition"
            :class="errors.due_date
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-400'"
          />
          <p v-if="errors.due_date" class="text-red-500 text-xs mt-1 ml-1">{{ errors.due_date }}</p>
        </div>

        <!-- Completed -->
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            v-model="completed"
            id="completed"
            class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label for="completed" class="font-medium text-gray-700 cursor-pointer">
            Mark as completed
          </label>
        </div>

        <!-- Submit -->
        <button
          @click="updateTodo"
          :disabled="loading || !userId"
          class="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Updating...' : 'Update Todo' }}
        </button>

        <NuxtLink
          to="/todos"
          class="block w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-center font-medium transition"
        >
          ← Cancel
        </NuxtLink>

      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>