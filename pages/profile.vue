<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref<{
  id: number
  name: string
  email: string
} | null>(null)

const loading  = ref(true)
const saving   = ref(false)
const editMode = ref(false)
const error    = ref<string | null>(null)
const success  = ref<string | null>(null)

const form = ref({ name: '', email: '', password: '' })
const fieldErrors = ref<{ name?: string; email?: string; password?: string }>({})

const showPassword = ref(false)

onMounted(async () => {
  try {
    const session = await $fetch<{ success: boolean; user?: any; message?: string }>('/api/auth/me', {
      credentials: 'include'
    })

    if (!session.success || !session.user) {
      router.push('/login')
      return
    }

    const res = await $fetch<{ success: boolean; user?: any; message?: string }>(`/api/users/${session.user.id}`, {
      credentials: 'include'
    })

    if (!res.success || !res.user) {
      error.value = res.message || 'Failed to load profile.'
      return
    }

    user.value       = res.user
    form.value.name  = res.user.name
    form.value.email = res.user.email
  } catch (err) {
    console.error('Failed to fetch user profile', err)
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
})

const enableEdit = () => {
  if (user.value) {
    form.value.name     = user.value.name
    form.value.email    = user.value.email
    form.value.password = ''
  }
  success.value     = null
  error.value       = null
  fieldErrors.value = {}
  showPassword.value = false
  editMode.value    = true
}

const cancelEdit = () => {
  editMode.value     = false
  error.value        = null
  success.value      = null
  fieldErrors.value  = {}
  showPassword.value = false
}

const handleSave = async () => {
  if (!user.value) return

  saving.value      = true
  error.value       = null
  success.value     = null
  fieldErrors.value = {}

  try {
    const res = await $fetch<{
      success: boolean
      message?: string
      field?: 'name' | 'email' | 'password'
    }>(`/api/users/${user.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        name:     form.value.name.trim(),
        email:    form.value.email.trim(),
        password: form.value.password || undefined
      }
    })

    if (!res.success && res.field) {
      fieldErrors.value[res.field] = res.message
      return
    }

    if (!res.success) {
      error.value = res.message || 'Failed to update profile.'
      return
    }

    user.value = {
      ...user.value,
      name:  form.value.name.trim(),
      email: form.value.email.trim()
    }

    success.value  = res.message || 'Profile updated successfully!'
    editMode.value = false
  } catch (err) {
    console.error('Failed to update profile', err)
    error.value = 'Failed to update profile. Please try again.'
  } finally {
    saving.value = false
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-10 px-4 relative flex items-center justify-center">

    <!-- Animated background blobs -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div class="absolute bottom-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="relative z-10 text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
      <p class="mt-4 text-gray-300">Loading profile...</p>
    </div>

    <!-- Error (load failure) -->
    <div v-else-if="error && !user" class="relative z-10 text-center">
      <p class="text-red-400 text-lg">{{ error }}</p>
      <button
        @click="router.back()"
        class="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
      >
        Go Back
      </button>
    </div>

    <!-- Profile Card -->
    <div v-else-if="user" class="relative z-10 w-full max-w-lg animate-fadeIn">

      <!-- Back Button -->
      <button
        @click="router.back()"
        class="group flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors duration-200"
      >
        <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-sm">Back to Dashboard</span>
      </button>

      <!-- Card -->
      <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

        <!-- Card Header -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-center relative">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur text-white text-2xl font-bold shadow-lg mb-4">
            {{ getInitials(user.name) }}
          </div>
          <h1 class="text-2xl font-bold text-white">{{ user.name }}</h1>
          <p class="text-blue-100 text-sm mt-1">{{ user.email }}</p>

          <!-- Edit toggle -->
          <button
            v-if="!editMode"
            @click="enableEdit"
            class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-all duration-200"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
            </svg>
            Edit
          </button>
        </div>

        <!-- Success Banner -->
        <div
          v-if="success"
          class="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ success }}
        </div>

        <!-- Error Banner -->
        <div
          v-if="error && user"
          class="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>

        <!-- Card Body -->
        <div class="px-6 py-6 space-y-4">

          <!-- ── VIEW MODE ── -->
          <template v-if="!editMode">

            <!-- Full Name -->
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400 text-xs uppercase tracking-wider">Full Name</p>
                <p class="text-white font-semibold">{{ user.name }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400 text-xs uppercase tracking-wider">Email Address</p>
                <p class="text-white font-semibold">{{ user.email }}</p>
              </div>
            </div>

            <!-- Password (masked) -->
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400 text-xs uppercase tracking-wider">Password</p>
                <p class="text-white font-semibold tracking-widest">••••••••</p>
              </div>
            </div>

          </template>

          <!-- ── EDIT MODE ── -->
          <template v-else>

            <!-- Name Input -->
            <div class="space-y-1.5">
              <label class="text-gray-400 text-xs uppercase tracking-wider pl-1">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Your full name"
                @input="fieldErrors.name = undefined"
                class="w-full px-4 py-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm font-medium outline-none border-2 border-transparent focus:border-purple-400 transition-all duration-200"
              />
              <p v-if="fieldErrors.name" class="text-red-400 text-xs pl-1">{{ fieldErrors.name }}</p>
            </div>

            <!-- Email Input -->
            <div class="space-y-1.5">
              <label class="text-gray-400 text-xs uppercase tracking-wider pl-1">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="Your email address"
                @input="fieldErrors.email = undefined"
                class="w-full px-4 py-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm font-medium outline-none border-2 border-transparent focus:border-purple-400 transition-all duration-200"
              />
              <p v-if="fieldErrors.email" class="text-red-400 text-xs pl-1">{{ fieldErrors.email }}</p>
            </div>

            <!-- Password Input -->
            <div class="space-y-1.5">
              <label class="text-gray-400 text-xs uppercase tracking-wider pl-1">
                New Password
                <span class="normal-case text-gray-500 ml-1">(leave blank to keep current)</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter new password"
                  @input="fieldErrors.password = undefined"
                  class="w-full px-4 py-3 pr-11 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm font-medium outline-none border-2 border-transparent focus:border-purple-400 transition-all duration-200"
                />
                <!-- Show / Hide toggle -->
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <!-- Eye open -->
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <!-- Eye closed -->
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p v-if="fieldErrors.password" class="text-red-400 text-xs pl-1">{{ fieldErrors.password }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-2">
              <button
                @click="cancelEdit"
                :disabled="saving"
                class="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                @click="handleSave"
                :disabled="saving"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>

          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
</style>