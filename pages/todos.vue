<script setup>
import { ref } from 'vue'
import { useTodoStore } from '~/stores/todoStore'
import TodoForm from '~/components/TodoForm.vue'
import TodoItem from '~/components/TodoItem.vue'
import Toast from '~/components/Toast.vue'

const store = useTodoStore()
const selectedTodo = ref(null)


const handleDelete = (id) => {
  const confirmed = window.confirm('Are you sure you want to delete this todo?')
  if (!confirmed) return
  store.deleteTodo(id)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">

    
    <div class="flex justify-between items-center mb-6 bg-white shadow-md rounded-lg p-4">
      <h1 class="text-3xl font-bold text-gray-800">All Todos</h1>
      <NuxtLink
        to="/"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        ← Back Home
      </NuxtLink>
    </div>

    
    <Toast />

    
    <div v-if="selectedTodo" class="max-w-md mx-auto mb-6">
      <TodoForm :editTodo="selectedTodo" />
      <button
        @click="selectedTodo = null"
        class="mt-2 w-full bg-gray-200 hover:bg-gray-300 rounded-lg py-2 text-gray-700 font-medium transition"
      >
        Cancel Edit
      </button>
    </div>

    
    <div v-if="!store.todos.length && !selectedTodo" class="text-center mt-20">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-gray-400 text-xl font-semibold">No todos added yet</p>
      <p class="text-gray-400 mt-2">Create your first task to get started!</p>
    </div>

   
    <div v-else class="max-w-4xl mx-auto">
      <div class="grid grid-cols-3 sm:grid-cols-2 gap-10">
        <TodoItem
          v-for="todo in store.todos"
          :key="todo.id"
          :todo="todo"
          @edit="selectedTodo = todo"
          @delete="handleDelete(todo.id)"
          class="transition transform hover:scale-105"
        />
      </div>
    </div>

  </div>
</template>
