import { reactive } from 'vue'

export const toastState = reactive({
  message: '',
  type: '', 
  visible: false
})

export const showToast = (message, type = 'success', duration = 2000) => {
  toastState.message = message
  toastState.type = type
  toastState.visible = true

  setTimeout(() => {
    toastState.visible = false
  }, duration)
}
