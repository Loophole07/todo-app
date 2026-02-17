<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type TodoStats = {
  total: number
  completed: number
  pending: number
  overdue: number
}

const stats = ref<TodoStats>({
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0
})

const loading = ref(true)

const completionPercentage = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

const fetchStats = async () => {
  loading.value = true
  
  try {
    const res = await $fetch<{ success: boolean; stats: TodoStats }>('/api/todos/stats', {
      credentials: 'include'
    })

    if (res.success && res.stats) {
      stats.value = res.stats
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
    </div>

    <!-- Stats Content -->
    <div v-else>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-300">Overall Progress</span>
          <span class="text-sm font-bold text-purple-400">{{ completionPercentage }}%</span>
        </div>
        <div class="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">

        <!-- Total Tasks -->
        <NuxtLink
          to="/todos"
          class="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-blue-400/40 hover:scale-[1.03] transition-all duration-200 cursor-pointer block"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span class="text-xs text-gray-400 font-medium">Total</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats.total }}</p>
        </NuxtLink>

        <!-- Completed -->
        <NuxtLink
          to="/todos?status=completed"
          class="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-400/40 hover:scale-[1.03] transition-all duration-200 cursor-pointer block"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-xs text-gray-400 font-medium">Completed</span>
          </div>
          <p class="text-3xl font-bold text-green-400">{{ stats.completed }}</p>
        </NuxtLink>

        <!-- Pending -->
        <NuxtLink
          to="/todos?status=in_progress"
          class="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-400/40 hover:scale-[1.03] transition-all duration-200 cursor-pointer block"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-xs text-gray-400 font-medium">In Progress</span>
          </div>
          <p class="text-3xl font-bold text-yellow-400">{{ stats.pending }}</p>
        </NuxtLink>

        <!-- Overdue -->
        <NuxtLink
          to="/todos?status=overdue"
          class="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-red-500/10 hover:border-red-400/40 hover:scale-[1.03] transition-all duration-200 cursor-pointer block"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-xs text-gray-400 font-medium">Overdue</span>
          </div>
          <p class="text-3xl font-bold text-red-400">{{ stats.overdue }}</p>
        </NuxtLink>

      </div>

      <!-- Empty State -->
      <div v-if="stats.total === 0" class="text-center py-6 mt-4">
        <p class="text-gray-400 text-sm">No tasks yet. Start creating!</p>
      </div>
    </div>
  </div>
</template>