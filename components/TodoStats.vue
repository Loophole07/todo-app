<script setup>
import { useTodoStore } from '~/stores/todoStore'
const store = useTodoStore()
</script>

<template>
  <div class="grid grid-cols-3 gap-3 mb-5">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
      <p class="text-sm text-blue-600">Total</p>
      <p class="text-xl font-bold text-blue-700">{{ store.totalTodos }}</p>
    </div>

    <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
      <p class="text-sm text-green-600">Completed</p>
      <p class="text-xl font-bold text-green-700">{{ store.completedTodos }}</p>
    </div>

    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
      <p class="text-sm text-yellow-600">Pending</p>
      <p class="text-xl font-bold text-yellow-700">{{ store.pendingTodos }}</p>
    </div>
  </div>
</template>
