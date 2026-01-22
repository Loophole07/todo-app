import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const visible = ref(false)

  const showToast = (msg) => {
    message.value = msg
    visible.value = true

    setTimeout(() => {
      visible.value = false
    }, 3000)
  }

  return { message, visible, showToast }
})
