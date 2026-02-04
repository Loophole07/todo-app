

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 py-10 px-4">
    <div class="max-w-3xl mx-auto">

      <div>
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800">
            Todo Manager
          </h1>
          <p class="text-gray-600 mt-2 text-sm">
            Add tasks and keep track of your progress
          </p>
        </div>

        <!-- Stats Card -->
        <div
          class="mb-6 rounded-2xl shadow-lg p-4
                 bg-gradient-to-r from-white to-blue-50"
        >
          <TodoStats />
        </div>

        <!-- Add / Edit Todo -->
        <div
          class="rounded-2xl shadow-lg p-5 mb-4
                 bg-gradient-to-r from-white to-indigo-50"
        >
          <h2 class="text-lg font-semibold text-gray-700 mb-3">
            ➕ Add New Todo
          </h2>
          <!-- <TodoForm :editTodo="selectedTodo" /> -->
        </div>

        <!-- Helper Text -->
        <p class="text-xs text-gray-600 text-center mb-4">
          Want to view, edit, or complete your tasks?
        </p>

        <!-- Manage Todos Button -->
        <NuxtLink
          to="/todos"
          class="block text-center bg-white/80 backdrop-blur border border-blue-600
                 text-blue-600 py-2.5 rounded-lg font-semibold
                 hover:bg-blue-50 transition"
        >
          📋 Manage Todos →
        </NuxtLink>

        <!-- Logout Button -->
        <!-- <button
          @click="store.logout()"
          class="block w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500
                 text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Logout
        </button> -->
      </div>

    </div>
  </div>
</template>

<style scoped>
/* optional: smooth transition for hover effects */
button:hover {
  transition: all 0.2s ease-in-out;
}
</style>
