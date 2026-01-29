<template>
  <div class="min-h-screen bg-gray-100 flex justify-center items-start py-12">
    <div class="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>

      <RegisterForm />

      <NuxtLink
        to="/"
        class="block text-center mt-4 text-blue-600 hover:underline text-sm"
      >
        ← Back to Login
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '~/components/RegisterForm.vue';
</script>
