<script setup>
import TodoItem from './TodoItem.vue'

defineProps({
  todos: Array
})
const emit = defineEmits(['edit'])
</script>

<template>
  <div>
    <!-- Empty state -->
    <div v-if="!todos.length" class="text-center py-10">
      <p class="text-gray-400 text-lg">📭 No todos added yet</p>
      <p class="text-sm text-gray-400 mt-1">
        Start by creating your first task
      </p>
    </div>

    <!-- Todo list -->
    <ul v-else class="space-y-3">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @edit="$emit('edit', $event)"
      />
    </ul>
  </div>
</template>
