<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const title       = ref('')
const description = ref('')
const category    = ref('')
const start_date  = ref('')
const due_date    = ref('')
const loading     = ref(false)
const userId      = ref<number | null>(null)

const errors = ref<Record<string, string>>({})

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

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', {
      credentials: 'include'
    })
    if (!res.success || !res.user) {
      showToast('You must be logged in!', 'error')
      setTimeout(() => router.push('/login'), 1500)
      return
    }
    userId.value = res.user.id
  } catch {
    showToast('Failed to verify session', 'error')
    setTimeout(() => router.push('/login'), 1500)
  }
})

const createTodo = async () => {
  if (loading.value) return

  if (!userId.value) {
    showToast('You must be logged in!', 'error')
    router.push('/login')
    return
  }

  errors.value = {}
  loading.value = true

  try {
    const res = await $fetch<{ success: boolean; message: string; field?: string }>('/api/todos/create', {
      method: 'POST',
      body: {
        title:       title.value,
        description: description.value,
        category:    category.value,
        start_date:  start_date.value,
        due_date:    due_date.value,
        completed:   false,
        user_id:     userId.value
      },
      credentials: 'include'
    })

    if (!res.success) {
      if (res.field) errors.value[res.field] = res.message
      showToast(res.message, 'error')
      return
    }

    showToast('Todo created successfully!', 'success')
    setTimeout(() => router.push('/todos'), 1200)

  } catch (err: any) {
    const msg = err?.data?.statusMessage || 'Failed to create todo'
    showToast(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- overflow-hidden prevents blobs from causing horizontal scroll -->
  <div class="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8 relative">

    <!-- Animated background blobs — contained inside overflow-hidden parent -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-10 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div class="absolute bottom-10 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Toast container -->
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
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

    <!-- Form -->
    <div class="relative z-10 w-full max-w-sm animate-fadeIn">

      <!-- Header -->
      <div class="text-center mb-5">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-3 transform hover:rotate-6 transition-transform duration-300">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 class="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Create New Task
        </h2>
        <p class="text-gray-400 text-xs mt-1">Fill in the details to add a task</p>
      </div>

      <!-- Card -->
      <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 space-y-3.5">

        <!-- Title -->
        <div class="space-y-1">
          <label class="text-gray-400 text-xs uppercase tracking-wider pl-0.5">Title</label>
          <input
            v-model="title"
            placeholder="What needs to be done?"
            @input="delete errors.title"
            class="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none border-2 transition-all duration-200"
            :class="errors.title
              ? 'bg-red-500/10 border-red-400 text-white placeholder-red-300'
              : 'bg-white text-slate-800 placeholder-slate-400 border-transparent focus:border-purple-400'"
          />
          <p v-if="errors.title" class="text-red-400 text-xs pl-0.5">{{ errors.title }}</p>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label class="text-gray-400 text-xs uppercase tracking-wider pl-0.5">
            Description <span class="normal-case text-gray-500">More about Todo</span>
          </label>
          <textarea
            v-model="description"
            placeholder="Add more details..."
            rows="2"
            @input="delete errors.description"
            class="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none border-2 transition-all duration-200 resize-none"
            :class="errors.description
              ? 'bg-red-500/10 border-red-400 text-white placeholder-red-300'
              : 'bg-white text-slate-800 placeholder-slate-400 border-transparent focus:border-purple-400'"
          ></textarea>
          <p v-if="errors.description" class="text-red-400 text-xs pl-0.5">{{ errors.description }}</p>
        </div>

        <!-- Category -->
        <div class="space-y-1">
          <label class="text-gray-400 text-xs uppercase tracking-wider pl-0.5">Category</label>
          <select
            v-model="category"
            @change="delete errors.category"
            class="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none border-2 transition-all duration-200 cursor-pointer"
            :class="errors.category
              ? 'bg-red-500/10 border-red-400 text-white'
              : 'bg-white text-slate-800 border-transparent focus:border-purple-400'"
          >
            <option value="" disabled class="bg-white text-slate-400">Select a category</option>
            <option value="study"    class="bg-white text-slate-800">📚 Study</option>
            <option value="bug"      class="bg-white text-slate-800">🐞 Bug</option>
            <option value="api"      class="bg-white text-slate-800">🔗 API</option>
            <option value="code"     class="bg-white text-slate-800">💻 Code</option>
            <option value="exam"     class="bg-white text-slate-800">📝 Exam</option>
            <option value="health"   class="bg-white text-slate-800">💖 Health</option>
            <option value="work"     class="bg-white text-slate-800">🏢 Work</option>
            <option value="personal" class="bg-white text-slate-800">👤 Personal</option>
            <option value="shopping" class="bg-white text-slate-800">🛒 Shopping</option>
          </select>
          <p v-if="errors.category" class="text-red-400 text-xs pl-0.5">{{ errors.category }}</p>
        </div>

        <!-- Dates row -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Start date -->
          <div class="space-y-1">
            <label class="text-gray-400 text-xs uppercase tracking-wider pl-0.5">Start</label>
            <input
              type="date"
              v-model="start_date"
              @change="delete errors.start_date"
              class="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border-2 transition-all duration-200"
              :class="errors.start_date
                ? 'bg-red-500/10 border-red-400 text-white'
                : 'bg-white text-slate-800 border-transparent focus:border-purple-400'"
            />
            <p v-if="errors.start_date" class="text-red-400 text-xs pl-0.5">{{ errors.start_date }}</p>
          </div>

          <!-- Due date -->
          <div class="space-y-1">
            <label class="text-gray-400 text-xs uppercase tracking-wider pl-0.5">Due</label>
            <input
              type="date"
              v-model="due_date"
              @change="delete errors.due_date"
              class="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border-2 transition-all duration-200"
              :class="errors.due_date
                ? 'bg-red-500/10 border-red-400 text-white'
                : 'bg-white text-slate-800 border-transparent focus:border-purple-400'"
            />
            <p v-if="errors.due_date" class="text-red-400 text-xs pl-0.5">{{ errors.due_date }}</p>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-white/10"></div>

        <!-- Submit -->
        <button
          @click="createTodo"
          :disabled="loading || !userId"
          class="w-full py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ loading ? 'Creating...' : 'Create Task' }}</span>
        </button>

        <!-- Back -->
        <NuxtLink
          to="/home"
          class="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white text-sm font-medium transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
.animate-blob   { animation: blob 7s infinite; }

.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to   { opacity: 0; transform: translateX(40px); }
</style>