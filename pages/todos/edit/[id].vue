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

const router = useRouter()
const route = useRoute()

const todoId = Number(route.params.id)

// Format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const isoString = date.toISOString()
    const parts = isoString.split('T')
    return parts[0] || ''
  } catch {
    return ''
  }
}

// Fetch user session 
onMounted(async () => {
  try {
    // Get =
    const userRes = await $fetch<{ success: boolean; user?: any }>('/api/auth/me', {
      credentials: 'include'
    })

    if (!userRes.success || !userRes.user) {
      alert('You must be logged in!')
      router.push('/login')
      return
    }

    userId.value = userRes.user.id

    // Fetch
    const todoRes = await $fetch<{ success: boolean; todo?: any }>(`/api/todos/${todoId}`, {
      credentials: 'include'
    })

    if (!todoRes.success || !todoRes.todo) {
      alert('Todo not found!')
      router.push('/todos')
      return
    }

    
    const todo = todoRes.todo
    title.value = todo.title || ''
    description.value = todo.description || ''
    category.value = todo.category || ''
    completed.value = todo.completed || false
    
    // Format dates 
    start_date.value = formatDate(todo.start_date)
    due_date.value = formatDate(todo.due_date)

  } catch (err) {
    console.error('Failed to load todo', err)
    alert('Failed to load todo')
    router.push('/todos')
  } finally {
    loadingTodo.value = false
  }
})

const updateTodo = async () => {
  if (loading.value || !userId.value) return

  loading.value = true

  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/todos/${todoId}`, {
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
      alert(res.message)
      return
    }

    alert('Todo updated successfully!')
    router.push('/todos')
  } catch (err) {
    console.error('UPDATE TODO ERROR ', err)
    alert('Failed to update todo')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 px-4">
    <!-- Loading State -->
    <div v-if="loadingTodo" class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-700">Loading todo...</p>
    </div>

    <!-- Edit Form -->
    <div v-else class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-800 tracking-wide">Edit Todo</h2>

      <div class="space-y-4">
        <input 
          v-model="title" 
          placeholder="Title" 
          class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm placeholder-gray-400 transition"
        />

        <textarea 
          v-model="description" 
          placeholder="Description" 
          rows="3" 
          class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm placeholder-gray-400 transition"
        ></textarea>

        <div>
          <select 
            v-model="category" 
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm transition"
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
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-gray-700 text-sm">Starting Date:</label>
          <input 
            type="date" 
            v-model="start_date" 
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm transition"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-gray-700 text-sm">Ending Date:</label>
          <input 
            type="date" 
            v-model="due_date" 
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm transition"
          />
        </div>

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
main {
  overflow: hidden;
}
</style>