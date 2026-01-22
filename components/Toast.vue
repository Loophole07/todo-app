<script setup>
import { toastState } from '~/utils/toast'
</script>

<template>
  <transition name="fade">
    <div
      v-if="toastState.visible"
      :class="[
        'fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50',
        toastState.type === 'success' ? 'bg-green-500' : '',
        toastState.type === 'error' ? 'bg-red-500' : '',
        toastState.type === 'info' ? 'bg-blue-500' : ''
      ]"
    >
      {{ toastState.message }}
    </div>
  </transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
