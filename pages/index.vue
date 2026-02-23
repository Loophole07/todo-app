<template>
  <div
    class="min-h-screen flex items-center justify-center 
           bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden"
  >
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Landscape Layout: Left + Right -->
    <div class="relative z-10 w-full max-w-6xl flex gap-8 items-center">

      <!-- LEFT SIDE — Branding & Features -->
      <div class="flex-1 text-white space-y-8">

        <!-- Logo & Title -->
        <div class="flex items-center gap-4 animate-fadeIn">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg transform hover:rotate-6 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p class="text-gray-400 text-sm">Simple. Efficient. Powerful.</p>
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-300 text-lg leading-relaxed animate-fadeIn delay-200">
          Organize your life, one task at a time. TaskFlow helps you stay on top of your work with a clean and simple interface designed for real productivity.
        </p>

        <!-- Feature List -->
        <div class="grid grid-cols-2 gap-4 animate-fadeIn delay-200">

          <div class="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
            <span class="text-2xl">📋</span>
            <div>
              <p class="font-semibold text-white text-sm">Task Management</p>
              <p class="text-gray-400 text-xs mt-1">Create and organize tasks easily</p>
            </div>
          </div>

          <div class="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
            <span class="text-2xl">🗂️</span>
            <div>
              <p class="font-semibold text-white text-sm">Categories</p>
              <p class="text-gray-400 text-xs mt-1">Sort tasks by category</p>
            </div>
          </div>

          <div class="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
            <span class="text-2xl">📅</span>
            <div>
              <p class="font-semibold text-white text-sm">Due Dates</p>
              <p class="text-gray-400 text-xs mt-1">Never miss a deadline</p>
            </div>
          </div>

          <div class="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
            <span class="text-2xl">✅</span>
            <div>
              <p class="font-semibold text-white text-sm">Track Progress</p>
              <p class="text-gray-400 text-xs mt-1">Mark and monitor completion</p>
            </div>
          </div>

          <div class="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
            <span class="text-2xl">🔒</span>
            <div>
              <p class="font-semibold text-white text-sm">Secure</p>
              <p class="text-gray-400 text-xs mt-1">Your data is always safe</p>
            </div>
          </div>

          <div class="flex items-start gap-3 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition">
            <span class="text-2xl">⚡</span>
            <div>
              <p class="font-semibold text-white text-sm">Fast & Easy</p>
              <p class="text-gray-400 text-xs mt-1">Built for productivity</p>
            </div>
          </div>

        </div>

        <!-- Stats -->
        <div class="flex gap-8 animate-fadeIn delay-400">
          <div class="text-center">
            <p class="text-3xl font-bold text-purple-400">100%</p>
            <p class="text-xs text-gray-400 mt-1">Free to use</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-400">∞</p>
            <p class="text-xs text-gray-400 mt-1">Tasks allowed</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-emerald-400">24/7</p>
            <p class="text-xs text-gray-400 mt-1">Always available</p>
          </div>
        </div>

        <!-- Copyright -->
        <p class="text-xs text-gray-500 animate-fadeIn delay-400">
          © 2026 TaskFlow. All rights reserved. ✨
        </p>

      </div>

      <!-- RIGHT SIDE — Buttons -->
      <div class="w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 space-y-4 animate-fadeIn">

        <h2 class="text-xl font-bold text-gray-800 text-center mb-6">Get Started</h2>

        <!-- Sign In -->
        <NuxtLink
          to="/login"
          class="group block py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600
                 text-white font-semibold rounded-xl shadow-lg
                 hover:shadow-2xl hover:scale-105 active:scale-95
                 transition-all duration-300 relative overflow-hidden text-center"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Sign In
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NuxtLink>

        <!-- Create Account -->
        <NuxtLink
          to="/register"
          class="group block py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600
                 text-white font-semibold rounded-xl shadow-lg
                 hover:shadow-2xl hover:scale-105 active:scale-95
                 transition-all duration-300 relative overflow-hidden text-center"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            Create Account
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NuxtLink>

        <!-- Divider -->
        <div class="flex items-center gap-3 py-1">
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <span class="text-xs text-gray-400 font-medium">ADMIN</span>
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        <!-- Admin Access -->
        <NuxtLink
          to="/admin/login"
          class="group block py-3 px-6 bg-gradient-to-r from-slate-700 to-slate-900
                 text-white font-semibold rounded-xl shadow-lg
                 hover:shadow-2xl hover:scale-105 active:scale-95
                 transition-all duration-300 relative overflow-hidden border border-slate-600 text-center"
        >
          <span class="relative z-10 flex items-center justify-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Admin Access
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NuxtLink>

        <p class="text-center text-xs text-gray-400 pt-2">
          Start organizing your tasks today ✨
        </p>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-fadeIn { animation: fadeIn 0.6s ease forwards; }
.animate-fadeIn.delay-200 { animation-delay: 0.2s; opacity: 0; }
.animate-fadeIn.delay-400 { animation-delay: 0.4s; opacity: 0; }
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
</style>