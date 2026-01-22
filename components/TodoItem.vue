<script setup>
import { computed, ref, watch } from 'vue'
import { useTodoStore } from '~/stores/todoStore'

const props = defineProps({ todo: Object })
const emit = defineEmits(['edit', 'delete'])
const store = useTodoStore()

//local reactive
const checked = ref(props.todo.completed)

//watch for local
watch(checked, (val) => {
  store.toggleTodo(props.todo.id)
})


const remainingDays = computed(() => {
  const today = new Date()
  const end = new Date(props.todo.endDate)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
})

const isOverdue = computed(() => !props.todo.completed && remainingDays.value < 0)
</script>

<template>
  <li
    class="border rounded-lg p-4 shadow-sm"
    :class="{
      'bg-red-50 border-red-300': isOverdue,
      'bg-white border-gray-200': !isOverdue
    }"
  >
    <div class="flex justify-between items-start">
      <div>
        <h3 :class="{ 'line-through text-gray-400': props.todo.completed, 'text-red-700': isOverdue }">
          {{ props.todo.title }}
        </h3>
        <p class="text-sm mt-1" :class="isOverdue ? 'text-red-500' : 'text-gray-500'">
          ⏳ <span v-if="isOverdue">Overdue</span>
          <span v-else-if="props.todo.completed">Completed ✅</span>
          <span v-else>{{ remainingDays }} days remaining</span>
        </p>
        <p class="text-xs text-gray-400 mt-1">🗓 {{ props.todo.startDate }} → {{ props.todo.endDate }}</p>
      </div>

      
      <input type="checkbox" v-model="checked" />
    </div>

    <div class="flex gap-3 mt-3 text-sm">
      <button @click="$emit('edit', props.todo)" class="text-blue-600 hover:underline">Edit</button>
      <button @click="$emit('delete', props.todo.id)" class="text-red-500 hover:underline">Delete</button>
    </div>
  </li>
</template>
