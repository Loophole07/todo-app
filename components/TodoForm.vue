<script setup>
import { ref, watch } from 'vue'
import { useTodoStore } from '~/stores/todoStore'
import { validateTodo } from '~/utils/validation'
import { showToast } from '~/utils/toast'

const store = useTodoStore()

const props = defineProps({
  editTodo: Object
})

const form = ref({
  title: '',
  startDate: '',
  endDate: '',
})

const errors = ref({})

//for changes
watch(
  () => props.editTodo,
  (newTodo) => {
    if (newTodo) {
      form.value.title = newTodo.title
      form.value.startDate = newTodo.startDate
      form.value.endDate = newTodo.endDate
    } else {
      form.value.title = ''
      form.value.startDate = ''
      form.value.endDate = ''
    }
  },
  { immediate: true } 
)

const submitTodo = () => {
  errors.value = validateTodo(form.value)
  if (Object.keys(errors.value).length) return

  if (props.editTodo) {
    const confirmed = window.confirm('Are you sure you want to update this todo?')
    if (!confirmed) return
    store.updateTodo(props.editTodo.id, { ...form.value })
    showToast('Todo updated successfully!', 'info')
  } else {
    store.addTodo({ ...form.value })
    showToast('Todo added successfully!', 'success')
  }

  
  form.value.title = ''
  form.value.startDate = ''
  form.value.endDate = ''
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 mb-6 border">
    <h2 class="text-lg font-semibold mb-4 text-gray-700">
      {{ props.editTodo ? 'Edit Todo' : 'Create New Todo' }}
    </h2>

 
    <label class="text-sm text-gray-600">Todo Title</label>
    <input
      v-model="form.title"
      class="w-full mt-1 mb-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
      placeholder="e.g. Finish assignment"
    />
    <p v-if="errors.title" class="text-red-500 text-sm">{{ errors.title }}</p>

    <div class="grid grid-cols-2 gap-3 mt-3">
      <div>
        <label class="text-sm text-gray-600">Start Date</label>
        <input
          type="date"
          v-model="form.startDate"
          class="w-full mt-1 border rounded-md p-2"
        />
      </div>

      <div>
        <label class="text-sm text-gray-600">Due Date</label>
        <input
          type="date"
          v-model="form.endDate"
          class="w-full mt-1 border rounded-md p-2"
        />
      </div>
    </div>

    <p v-if="errors.date" class="text-red-500 text-sm mt-2">{{ errors.date }}</p>

    
    <button
      @click="submitTodo"
      class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
    >
      {{ props.editTodo ? 'Update Todo' : 'Add Todo' }}
    </button>
  </div>
</template>
