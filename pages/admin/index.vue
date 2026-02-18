<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UsersTable from '~/components/UsersTable.vue'
import TodosTable from '~/components/TodosTable.vue'
import CategoryUserList from '~/components/analytics/CategoryUserList.vue'

const router = useRouter()

// Sidebar links
const links = [
  { title: 'Dashboard', id: 'dashboard' },
  { title: 'Users', id: 'users' },
  { title: 'Todos', id: 'todos' },
]

// Stats
type Stat = { title: string; value: number }
const stats = ref<Stat[]>([
  { title: 'Total Users', value: 0 },
  { title: 'Total Todos', value: 0 },
])

// Users
type User = { id: number; name: string; email: string }
const users = ref<User[]>([])
const usersLoading = ref(true)
const usersError = ref('')

// Todos
type Todo = {
  id: number
  title: string
  description: string
  completed: boolean
  start_date: string
  due_date: string
  user_id: number
  category: string
}
const todos = ref<Todo[]>([])
const todosLoading = ref(true)
const todosError = ref('')

// Analytics
const categoryStats = ref<Record<string, number>>({})
const selectedCategory = ref<string | null>(null)
const activeTab = ref('dashboard')

// ── Toast ─────────────────────────────────────────────────
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

// Fetch stats
const fetchStats = async () => {
  try {
    const usersRes = await $fetch<{ success: boolean; totalUsers: number }>('/api/admin/users/get-count')
    const todosRes = await $fetch<{ success: boolean; totalTodos: number }>('/api/admin/todos/get-count')

    stats.value.find(s => s.title === 'Total Users')!.value = usersRes?.totalUsers ?? 0
    stats.value.find(s => s.title === 'Total Todos')!.value = todosRes?.totalTodos ?? 0
  } catch (err) {
    console.error('FETCH STATS ERROR:', err)
  }
}

// Fetch users
const fetchUsers = async () => {
  usersLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; users: User[] }>('/api/admin/users')
    users.value = res?.users ?? []
  } catch (err) {
    console.error('FETCH USERS ERROR:', err)
    usersError.value = 'Failed to fetch users'
  } finally {
    usersLoading.value = false
  }
}

// Fetch todos
const fetchTodos = async () => {
  todosLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; todos: Todo[] }>('/api/admin/todos')
    todos.value = res?.todos ?? []
  } catch (err) {
    console.error('FETCH TODOS ERROR:', err)
    todosError.value = 'Failed to fetch todos'
  } finally {
    todosLoading.value = false
  }
}

// Fetch category stats
const fetchCategoryStats = async () => {
  try {
    const res = await $fetch<{ success: boolean; data: Record<string, number> }>('/api/analytics/todo-categories')
    if (res?.success) categoryStats.value = res.data
  } catch (err) {
    console.error('FETCH CATEGORY STATS ERROR:', err)
  }
}

// View users by category
const viewCategoryUsers = (category: string) => {
  selectedCategory.value = category
  activeTab.value = 'category-users'
}

// ── Logout ────────────────────────────────────────────────
const logout = async () => {
  if (!confirm('Are you sure you want to logout?')) return

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/logout', {
      method: 'POST',
    })

    if (res.success) {
      showToast(res.message, 'success')
      setTimeout(() => router.push('/'), 1500)
    }
  } catch (err: any) {
    console.error('LOGOUT ERROR:', err)
    showToast(err?.data?.statusMessage || 'Failed to logout', 'error')
  }
}

// Initial fetch
onMounted(() => {
  fetchStats()
  fetchUsers()
  fetchTodos()
  fetchCategoryStats()
})
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">

    <!-- Toast Notification -->
    <transition name="fade">
      <div
        v-if="toast"
        :class="[
          'fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium',
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        ]"
      >
        {{ toast.message }}
      </div>
    </transition>

    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg flex flex-col p-6">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-blue-600">Admin Panel</h2>
      </div>

      <nav class="flex flex-col gap-3 flex-1">
        <button
          v-for="link in links"
          :key="link.id"
          @click="activeTab = link.id; selectedCategory = null"
          :class="[
            'p-3 rounded-lg text-left font-medium hover:bg-blue-100 transition',
            activeTab === link.id ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-700'
          ]"
        >
          {{ link.title }}
        </button>
      </nav>

      <!-- Logout Button -->
      <div class="mt-auto pt-6 border-t border-gray-200">
        <button
          @click="logout"
          class="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <header class="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 class="text-2xl font-semibold capitalize text-gray-800">
          {{ activeTab === 'category-users' ? selectedCategory : activeTab }}
        </h1>
      </header>

      <main class="p-6 flex-1 flex flex-col gap-6 overflow-hidden">

        <!-- Dashboard -->
        <div v-if="activeTab === 'dashboard'" class="space-y-6">

          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl shadow hover:shadow-xl transition flex items-center gap-4"
            >
              <div class="text-blue-600 text-4xl">
                <svg v-if="stat.title === 'Total Users'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11c1.656 0 3-1.344 3-3S17.656 5 16 5s-3 1.344-3 3 1.344 3 3 3zM8 11c1.656 0 3-1.344 3-3S9.656 5 8 5 5 6.344 5 8s1.344 3 3 3zM8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zM16 13c-.29 0-.62.02-.97.05 1.45.91 2.97 1.65 3.97 2.21V19h4v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-5 10v-4m0 0V7m0 6h-4m4 0h4M3 21h18M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-700">{{ stat.title }}</h3>
                <p class="text-3xl font-bold mt-1 text-gray-900">{{ stat.value }}</p>
              </div>
            </div>
          </div>

          <!-- Category Analytics -->
          <div class="bg-white rounded-2xl shadow p-6">
            <h2 class="text-xl font-semibold mb-6 text-gray-800">Most Common Help Areas</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              <div
                v-for="(count, category) in categoryStats"
                :key="category"
                class="p-6 border border-gray-200 rounded-2xl hover:shadow-lg cursor-pointer transition flex flex-col items-center justify-center"
                @click="viewCategoryUsers(category)"
              >
                <p class="text-gray-500 text-sm">{{ category }}</p>
                <p class="text-4xl font-bold text-gray-800 mt-2">{{ count }}</p>
                <p class="text-gray-400 text-xs mt-1">todos</p>
                <div class="w-12 h-1 bg-blue-400 rounded-full mt-3"></div>
              </div>

              <p
                v-if="Object.keys(categoryStats).length === 0"
                class="text-center text-gray-400 col-span-full py-10"
              >
                No analytics data available
              </p>
            </div>
          </div>
        </div>

        <!-- Users by category -->
        <div v-if="activeTab === 'category-users' && selectedCategory">
          <CategoryUserList v-if="selectedCategory" :category="selectedCategory" />
        </div>

        <!-- Users Table -->
        <div v-if="activeTab === 'users'" class="bg-white rounded-2xl shadow p-6">
          <UsersTable v-if="!usersLoading && !usersError" :users="users" />
          <div v-else-if="usersLoading" class="text-gray-500 text-center py-20 text-lg font-medium">
            Loading users...
          </div>
          <div v-else class="text-red-500 text-center py-20 text-lg font-medium">{{ usersError }}</div>
        </div>

        <!-- Todos Table -->
        <div v-if="activeTab === 'todos'" class="bg-white rounded-2xl shadow p-6">
          <TodosTable v-if="!todosLoading && !todosError" :todos="todos" />
          <div v-else-if="todosLoading" class="text-gray-500 text-center py-20 text-lg font-medium">
            Loading todos...
          </div>
          <div v-else class="text-red-500 text-center py-20 text-lg font-medium">{{ todosError }}</div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
main {
  overflow: hidden;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>