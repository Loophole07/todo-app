<template>
  <!-- Page wrapper -->
  <div class="bg-gray-100 min-h-screen px-4 pt-20">
    
    <!-- Centered Card -->
    <div class="mx-auto w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">

      <!-- Header -->
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-5">
         My Todos
      </h1>

      <!-- Form -->
      <TodoForm />

      <!-- Todo List -->
      <ul v-if="todoStore.todos.length" class="space-y-2">
        <li
          v-for="todo in todoStore.todos"
          :key="todo.id"
          class="group flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg border hover:shadow-sm transition"
        >
          <span class="text-gray-70 text-sm truncate">
            {{ todo.title }}
          </span>

          <div class="flex gap-3 text-xs opacity-0 group-hover:opacity-100 transition">
            <button class="text-blue-500 hover:underline">
              Edit
            </button>
            <button class="text-red-500 hover:underline">
              Delete
            </button>
          </div>
        </li>
      </ul>

      <!-- Empty State -->
      <p
        v-else
        class="text-center text-gray-400 text-sm mt-6"
      >
        No todos yet
        <br />Add your first task above.
      </p>

    </div>
  </div>
  
</template>

<script setup>
const todoStore = useTodoStore()
</script>


