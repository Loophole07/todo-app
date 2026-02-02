<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UsersTable from '~/components/UsersTable.vue'
import TodosTable from '~/components/TodosTable.vue'

// --- Sidebar Links ---
const links = [
  { title: 'Dashboard', id: 'dashboard' },
  { title: 'Users', id: 'users' },
  { title: 'Todos', id: 'todos' },
  { title: 'Settings', id: 'settings' },
]

const activeTab = ref('dashboard')

// --- Stats ---
type Stat = { title: string; value: number }
const stats = ref<Stat[]>([
  { title: 'Total Users', value: 0 },
  { title: 'Total Todos', value: 0 },
])

// --- Users ---
type User = { id: number; name: string; email: string }
const users = ref<User[]>([])
const usersLoading = ref(true)
const usersError = ref('')

// --- Todos ---
type Todo = { id: number; title: string; description: string; completed: boolean; start_date: string; due_date: string; user_id: number }
const todos = ref<Todo[]>([])
const todosLoading = ref(true)
const todosError = ref('')

// --- Category Analytics ---
const categoryStats = ref<Record<string, number>>({})

const fetchStats = async () => {
  try {
    const usersRes = await $fetch<{ success: boolean; totalUsers: number }>('/api/users/get-count')
    const todosRes = await $fetch<{ success: boolean; totalTodos: number }>('/api/todos/get-count')
    const usersStat = stats.value.find(s => s.title === 'Total Users')
    const todosStat = stats.value.find(s => s.title === 'Total Todos')
    if (usersStat) usersStat.value = usersRes?.totalUsers ?? 0
    if (todosStat) todosStat.value = todosRes?.totalTodos ?? 0
  } catch (err) {
    console.error('Error fetching stats:', err)
    const usersStat = stats.value.find(s => s.title === 'Total Users')
    const todosStat = stats.value.find(s => s.title === 'Total Todos')
    if (usersStat) usersStat.value = 0
    if (todosStat) todosStat.value = 0
  }
}

const fetchUsers = async () => {
  usersLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; users: User[] }>('/api/users')
    users.value = res?.users ?? []
  } catch (err) {
    usersError.value = 'Failed to load users'
  } finally {
    usersLoading.value = false
  }
}

const fetchTodos = async () => {
  todosLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; todos: Todo[] }>('/api/todos')
    todos.value = res?.todos ?? []
  } catch (err) {
    todosError.value = 'Failed to load todos'
  } finally {
    todosLoading.value = false
  }
}

const fetchCategoryStats = async () => {
  try {
    const res = await $fetch<{ success: boolean; data: Record<string, number> }>('/api/analytics/todo-categories')
    if (res?.success) categoryStats.value = res.data
  } catch (err) {
    console.error('Failed to fetch category stats:', err)
  }
}

onMounted(() => {
  fetchStats()
  fetchUsers()
  fetchTodos()
  fetchCategoryStats()
})
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow flex flex-col p-4">
      <h2 class="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav class="flex flex-col gap-3">
        <button
          v-for="link in links"
          :key="link.id"
          @click="activeTab = link.id"
          :class="[
            'p-2 rounded text-left hover:bg-gray-200 transition',
            activeTab === link.id ? 'bg-gray-200 font-semibold' : ''
          ]"
        >
          {{ link.title }}
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <header class="bg-white shadow p-4 flex justify-between items-center">
        <h1 class="text-xl font-semibold capitalize">{{ activeTab }}</h1>
        <NuxtLink
          to="/"
          class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Go to Home
        </NuxtLink>
      </header>

      <!-- Main Content Area -->
      <main class="p-6 flex-1 overflow-auto">
        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 class="text-lg font-semibold text-gray-700">{{ stat.title }}</h3>
              <p class="text-3xl font-bold mt-2 text-gray-900">{{ stat.value }}</p>
            </div>
          </div>

          <!-- Category Analytics -->
          <div class="bg-white rounded-xl shadow p-6">
            <h2 class="text-xl font-semibold mb-4">
              Most Common Help Areas
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(count, category) in categoryStats"
                :key="category"
                class="border rounded-lg p-4 hover:shadow transition"
              >
                <p class="text-sm text-gray-500">{{ category }}</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">{{ count }}</p>
                <p class="text-xs text-gray-400 mt-1">todos</p>
              </div>
              <p
                v-if="Object.keys(categoryStats).length === 0"
                class="text-center text-gray-500 col-span-full py-6"
              >
                No analytics data available
              </p>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="bg-white shadow rounded-xl p-6">
          <h2 class="text-xl font-semibold mb-4">Users Panel</h2>
          <div v-if="usersLoading" class="text-gray-500 text-center py-10">Loading users...</div>
          <div v-else-if="usersError" class="text-red-500 text-center py-10">{{ usersError }}</div>
          <UsersTable v-else :users="users" />
        </div>

        <!-- Todos Tab -->
        <div v-if="activeTab === 'todos'" class="bg-white shadow rounded-xl p-6">
          <h2 class="text-xl font-semibold mb-4">Todos Panel</h2>
          <div v-if="todosLoading" class="text-gray-500 text-center py-10">Loading todos...</div>
          <div v-else-if="todosError" class="text-red-500 text-center py-10">{{ todosError }}</div>
          <TodosTable v-else :todos="todos" />
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="bg-white shadow rounded-xl p-6 max-w-lg">
          <h2 class="text-xl font-semibold mb-4">Settings</h2>
          <form class="space-y-4">
            <div>
              <label class="block mb-1 font-medium">Username</label>
              <input type="text" class="w-full border p-2 rounded" placeholder="Admin" />
            </div>
            <div>
              <label class="block mb-1 font-medium">Email</label>
              <input type="email" class="w-full border p-2 rounded" placeholder="admin@example.com" />
            </div>
            <div>
              <label class="block mb-1 font-medium">Password</label>
              <input type="password" class="w-full border p-2 rounded" placeholder="••••••" />
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Reset</button>
              <button type="button" class="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">Save</button>
            </div>
          </form>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
