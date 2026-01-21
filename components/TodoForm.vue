<template>
  <form @submit.prevent="submitTodo" class="mb-4">
    <div class="relative">
      <input
        v-model="title"
        type="text"
        placeholder="What needs to be done?"
        class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <p v-if="error" class="text-red-500 text-xs mt-1">
      {{ error }}
    </p>

    <button
      type="submit"
      class="mt-3 w-full bg-blue-600 text-white text-sm py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition"
    >
      + Add Todo
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const todoStore = useTodoStore()

const title = ref('')
const error = ref('')

const submitTodo = () => {
  if (!title.value.trim()) {
    error.value = 'Please enter a todo'
    return
  }

  todoStore.addTodo(title.value)

  title.value = ''
  error.value = ''
}
</script>


