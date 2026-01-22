<script setup>
import { ref } from 'vue'
import { useTodoStore } from '~/stores/todoStore'

import TodoForm from '~/components/TodoForm.vue'
import TodoList from '~/components/TodoList.vue'
import TodoStats from '~/components/TodoStats.vue'
import Toast from '~/components/Toast.vue'

const store = useTodoStore()
const selectedTodo = ref(null)
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6">
    <div class="max-w-md mx-auto px-4">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">
        Todo Manager
      </h1>
      <Toast />
      
      <TodoStats />
      
      <TodoForm :editTodo="selectedTodo" />
      
      <NuxtLink to="/todos" class="text-blue-600 hover:underline text-sm">
      View All Todos
      </NuxtLink>
      
    </div>
  </div>
</template>
