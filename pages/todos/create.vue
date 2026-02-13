<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#app'  // Nuxt composable to read cookies

const title = ref('')
const description = ref('')
const category = ref('')
const start_date = ref('')
const due_date = ref('')
const completed = ref(false)
const loading = ref(false)

const router = useRouter()

const createTodo = async () => {
  if (loading.value) return
  loading.value = true

  try {
    
    const userSession = useCookie('user_session')
    if (!userSession.value) {
      alert('You must be logged in!')
      router.push('/login')
      return
    }

    const user_id = Number(userSession.value)

  
    const res = await $fetch<{ success: boolean; message: string }>('/api/todos/create', {
      method: 'POST',
      body: {
        title,
        description,
        category,
        start_date,
        due_date,
        completed,
        user_id
      },
      credentials: 'include'
    })

    if (!res.success) {
      alert(res.message)
      return
    }

    alert('Todo created successfully!')
    router.push('/todos') 
  } catch (err) {
    console.error('CREATE TODO ERROR ', err)
    alert('Failed to create todo')
  } finally {
    loading.value = false
  }
}

</script>


<template>
  <div class="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 px-4">
    <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-800 tracking-wide">Create Todo</h2>

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

        <button 
          @click="createTodo"
          :disabled="loading"
          class="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Saving...' : 'Create Todo' }}
        </button>

        <NuxtLink 
          to="/home" 
          class="block w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-center font-medium transition"
        >
          ← Back
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