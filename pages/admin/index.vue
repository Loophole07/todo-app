<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UsersTable from '~/components/UsersTable.vue'
import TodosTable from '~/components/TodosTable.vue'
import CategoryUserList from '~/components/analytics/CategoryUserList.vue'

//sidebar
const links = [
  { title: 'Dashboard', id: 'dashboard' },
  { title: 'Users', id: 'users' },
  { title: 'Todos', id: 'todos' },
]

//stats
type Stat = { title: string; value: number }
const stats = ref<Stat[]>([
  { title: 'Total Users', value: 0 },
  { title: 'Total Todos', value: 0 },
])

//users
type User = { id: number; name: string; email: string }
const users = ref<User[]>([])
const usersLoading = ref(true)
const usersError = ref('')

//todos
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

//analytics
const categoryStats = ref<Record<string, number>>({})

//select category
const selectedCategory = ref<string | null>(null)
const activeTab = ref('dashboard')

//stats
const fetchStats = async () => {
  const usersRes = await $fetch<{ success: boolean; totalUsers: number }>('/api/users/get-count')
  const todosRes = await $fetch<{ success: boolean; totalTodos: number }>('/api/todos/get-count')

  const usersStat = stats.value.find(s => s.title === 'Total Users')
  const todosStat = stats.value.find(s => s.title === 'Total Todos')

  if (usersStat) usersStat.value = usersRes?.totalUsers ?? 0
  if (todosStat) todosStat.value = todosRes?.totalTodos ?? 0
}

const fetchUsers = async () => {
  usersLoading.value = true
  const res = await $fetch<{ success: boolean; users: User[] }>('/api/users')
  users.value = res?.users ?? []
  usersLoading.value = false
}

const fetchTodos = async () => {
  todosLoading.value = true
  const res = await $fetch<{ success: boolean; todos: Todo[] }>('/api/todos')
  todos.value = res?.todos ?? []
  todosLoading.value = false
}

const fetchCategoryStats = async () => {
  const res = await $fetch<{ success: boolean; data: Record<string, number> }>('/api/analytics/todo-categories')
  if (res?.success) categoryStats.value = res.data
}

//clicked
const viewCategoryUsers = (category: string) => {
  selectedCategory.value = category
  activeTab.value = 'category-users'
}

//intial
onMounted(() => {
  fetchStats()
  fetchUsers()
  fetchTodos()
  fetchCategoryStats()
})
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg flex flex-col p-6">
      <h2 class="text-3xl font-bold mb-8 text-blue-600">Admin Panel</h2>
      <nav class="flex flex-col gap-3">
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
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <header class="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 class="text-2xl font-semibold capitalize text-gray-800">
          {{ activeTab === 'category-users' ? selectedCategory : activeTab }}
        </h1>
      </header>

     
      <main class="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
       
        <div v-if="activeTab === 'dashboard'" class="space-y-6">
        
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

       
        <div v-if="activeTab === 'category-users' && selectedCategory">
          <CategoryUserList v-if="selectedCategory" :category="selectedCategory" />
        </div>

    
        <div v-if="activeTab === 'users'" class="bg-white rounded-2xl shadow p-6">
          <UsersTable v-if="!usersLoading && !usersError" :users="users" />
          <div v-else-if="usersLoading" class="text-gray-500 text-center py-20 text-lg font-medium">
            Loading users...
          </div>
          <div v-else class="text-red-500 text-center py-20 text-lg font-medium">{{ usersError }}</div>
        </div>

       
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
</style>
