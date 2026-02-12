<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-10 px-4 relative">
    <!-- Animated background elements - contained within viewport -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div class="absolute bottom-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <div>
        <!-- Header -->
        <div class="text-center mb-10 animate-fadeIn">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-4 transform hover:rotate-6 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Task Dashboard
          </h1>
          <p class="text-gray-300 mt-2 text-sm md:text-base px-4">
            Organize, track, and accomplish your goals
          </p>
        </div>

        <!-- Stats Card -->
        <div
          class="mb-6 rounded-2xl shadow-2xl p-5 md:p-6
                 bg-white/10 backdrop-blur-xl border border-white/20
                 hover:bg-white/15 transition-all duration-300 animate-fadeIn delay-200"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h2 class="text-lg md:text-xl font-semibold text-white">Your Progress</h2>
          </div>
          <TodoStats />
        </div>

       

        <!-- Action Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fadeIn delay-400">
          <!-- Home Link Button -->
          <NuxtLink
            to="/"
            class="group relative rounded-xl shadow-lg
                   bg-white/10 backdrop-blur-xl border border-white/20
                   hover:bg-white/15 hover:shadow-2xl hover:scale-[1.02]
                   transition-all duration-300 p-4 md:p-5 flex items-center gap-3 md:gap-4"
          >
            <div class="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <div class="text-left flex-1 min-w-0">
              <h3 class="text-white font-semibold text-base md:text-lg truncate">Back to Home</h3>
              <p class="text-gray-400 text-xs md:text-sm truncate">Return to main menu</p>
            </div>
            <svg class="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>

          <!-- Manage Todos Button -->
          <NuxtLink
            to="/todos/create"
            class="group relative rounded-xl shadow-lg
                   bg-gradient-to-r from-purple-600 to-blue-600
                   hover:from-purple-700 hover:to-blue-700
                   hover:shadow-2xl hover:scale-[1.02]
                   transition-all duration-300 p-4 md:p-5 flex items-center gap-3 md:gap-4"
          >
            <div class="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <div class="text-left flex-1 min-w-0">
              <h3 class="text-white font-semibold text-base md:text-lg truncate">Create Tasks</h3>
              <p class="text-blue-100 text-xs md:text-sm truncate">Add and manage your todos</p>
            </div>
            <svg class="w-5 h-5 text-white flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </NuxtLink>
        </div>

        <!-- Helper Text -->
        <div class="text-center animate-fadeIn delay-500 px-4">
          <p class="text-gray-400 text-xs md:text-sm flex items-center justify-center gap-2 flex-wrap">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Click on "Create Tasks" to view, edit, or complete your tasks</span>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fade-in animation */
@keyframes fadeIn {
  0% { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Blob animation for background */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

.animate-fadeIn.delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}

.animate-fadeIn.delay-300 {
  animation-delay: 0.3s;
  opacity: 0;
}

.animate-fadeIn.delay-400 {
  animation-delay: 0.4s;
  opacity: 0;
}

.animate-fadeIn.delay-500 {
  animation-delay: 0.5s;
  opacity: 0;
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Smooth transition for all interactive elements */
button:hover,
a:hover {
  transition: all 0.3s ease-in-out;
}
</style>