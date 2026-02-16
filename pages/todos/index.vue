<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

type Todo = {
  id: number
  title: string
  description?: string
  category: string
  start_date: string
  due_date: string
  completed: boolean
  user_id?: number
}

const todos = ref<Todo[]>([])
const loading = ref(false)
const message = ref('')
const page = ref(1)
const totalPages = ref(1)
const userId = ref<number | null>(null)

const router = useRouter()

const fetchTodos = async () => {
  loading.value = true
  message.value = ''

  try {
    const res = await $fetch<{
      success: boolean
      todos: Todo[]
      pagination: { totalPages: number }
      message?: string
    }>('/api/todos?page=' + page.value + '&perPage=6', {
      credentials: 'include'
    })

    if (!res.success) {
      message.value = res.message || 'Failed to fetch todos'
      return
    }

    todos.value = res.todos
    totalPages.value = res.pagination.totalPages

  } catch (err) {
    console.error(err)
    message.value = 'Error loading todos'
  } finally {
    loading.value = false
  }
}

const deleteTodo = async (id: number) => {
  if (!confirm('Are you sure you want to delete this todo?')) return

  try {
    await $fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    await fetchTodos()
  } catch (err) {
    alert('Delete failed')
  }
}

const toggleComplete = async (todo: Todo) => {
  try {
    if (!userId.value) {
      const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', {
        credentials: 'include'
      })
      if (userRes.success && userRes.user) {
        userId.value = userRes.user.id
      }
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
        user_id: userId.value
      },
      credentials: 'include'
    })
    
    await fetchTodos()
  } catch (err) {
    console.error('Toggle error:', err)
    alert('Update failed')
  }
}

const getCategoryEmoji = (category: string) => {
  const emojiMap: { [key: string]: string } = {
    study: '📚',
    bug: '🐞',
    api: '🔗',
    code: '💻',
    exam: '📝',
    health: '💖',
    work: '🏢',
    personal: '👤',
    shopping: '🛒'
  }
  return emojiMap[category] || '📌'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchTodos()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchTodos()
  }
}

onMounted(async () => {
  const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', {
    credentials: 'include'
  })
  
  if (!userRes.success || !userRes.user) {
    router.push('/login')
    return
  }
  
  userId.value = userRes.user.id
  await fetchTodos()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div class="absolute bottom-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
      
      <!-- Header Section -->
      <div class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 mb-6 animate-fadeIn">
        <div class="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
              My Task List
            </h1>
            <p class="text-sm text-gray-300">Manage your daily tasks efficiently</p>
          </div>
          
          <div class="flex gap-3">
            <NuxtLink 
              to="/home" 
              class="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </NuxtLink>
            
            <NuxtLink 
              to="/todos/create" 
              class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add New
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="message" class="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 backdrop-blur-lg">
        {{ message }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12 animate-fadeIn">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
        <p class="text-gray-300 mt-3">Loading tasks...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="todos.length === 0" class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center animate-fadeIn">
        <svg class="w-16 h-16 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="text-white text-lg">No tasks found</p>
        <p class="text-gray-400 text-sm mt-2">Create your first task to get started</p>
      </div>

      <!-- Todos Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all p-5 animate-fadeIn"
          :class="{ 'opacity-60': todo.completed }"
        >
          <!-- Category Badge -->
          <div class="flex justify-between items-start mb-3">
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-lg border border-purple-500/30">
              {{ getCategoryEmoji(todo.category) }}
              {{ todo.category }}
            </span>
            <input 
              type="checkbox" 
              :checked="todo.completed"
              @change="toggleComplete(todo)"
              class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer bg-white/20 border-white/30"
            >
          </div>

          <!-- Title & Description -->
          <h3 
            class="font-semibold text-lg mb-2 text-white"
            :class="{ 'line-through text-gray-400': todo.completed }"
          >
            {{ todo.title }}
          </h3>
          <p class="text-sm text-gray-300 mb-3 line-clamp-2">
            {{ todo.description || 'No description' }}
          </p>

          <!-- Dates -->
          <div class="flex gap-2 text-xs text-gray-400 mb-4 pb-4 border-b border-white/10">
            <span>📅 {{ formatDate(todo.start_date) }}</span>
            <span>→</span>
            <span>⏰ {{ formatDate(todo.due_date) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <NuxtLink
              :to="`/todos/edit-${todo.id}`"
              class="flex-1 text-center text-sm px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all border border-yellow-500/30"
            >
              Edit
            </NuxtLink>
            <button
              @click="deleteTodo(todo.id)"
              class="flex-1 text-sm px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 flex justify-center items-center gap-4 animate-fadeIn">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/20"
        >
          Previous
        </button>

        <span class="text-white font-medium">
          Page {{ page }} of {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  0% { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>