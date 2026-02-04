<script setup>
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center 
           bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-6"
  >
    <div
      class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center max-w-sm w-full
             border border-white/30"
    >
      <!-- Heading -->
      <h1 class="text-4xl font-extrabold text-gray-800 mb-2 animate-fadeIn">
        Welcome!
      </h1>
      
      <!-- Description -->
      <p class="text-gray-600 mb-8 animate-fadeIn delay-200">
        Welcome to <span class="font-semibold">Todo App</span>! 
        Here you can <span class="font-medium">add, manage, and track</span> all your tasks 
        efficiently and stay productive.
      </p>

      <!-- Buttons -->
      <div class="space-y-4">
        <!-- User Login -->
        <NuxtLink
          to="/login"
          class="block py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600
                 text-white font-semibold rounded-xl shadow-md
                 hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          User Login
        </NuxtLink>

        <!-- User Register -->
        <NuxtLink
          to="/register"
          class="block py-3 px-6 bg-gradient-to-r from-green-500 to-green-600
                 text-white font-semibold rounded-xl shadow-md
                 hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          User Register
        </NuxtLink>

        <!-- Admin Login -->
        <NuxtLink
          to="/admin/login"
          class="block py-3 px-6 bg-gradient-to-r from-gray-700 to-gray-800
                 text-white font-semibold rounded-xl shadow-md
                 hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          Admin Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Subtle fade-in animation for heading and paragraph */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

.animate-fadeIn.delay-200 {
  animation-delay: 0.2s;
}
</style>
