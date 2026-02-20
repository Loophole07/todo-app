<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type User = { id: number; name: string; email: string }

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const name = ref('')
const email = ref('')
const loading = ref(false)

const errors = ref<{ name?: string; email?: string }>({})

const confirmDialog = ref(false)

const askUpdate = () => {
  errors.value = {}
  if (!name.value.trim() || !email.value.trim()) {
    if (!name.value.trim()) errors.value.name = 'Name is required'
    if (!email.value.trim()) errors.value.email = 'Email is required'
    return
  }
  confirmDialog.value = true
}

const cancelUpdate = () => {
  confirmDialog.value = false
}

const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

const fetchUser = async () => {
  try {
    const res = await $fetch<{ success: boolean; user?: User }>(`/api/admin/users/${id}`)
    if (res.success && res.user) {
      name.value = res.user.name
      email.value = res.user.email
    } else {
      showToast('User not found', 'error')
    }
  } catch (err: any) {
    showToast(err?.data?.statusMessage || 'Failed to fetch user', 'error')
  }
}

const updateUser = async () => {
  confirmDialog.value = false
  loading.value = true

  try {
    const res = await $fetch<{ success: boolean; message?: string; field?: string }>(
      `/api/admin/users/${id}`,
      { method: 'PUT', body: { name: name.value, email: email.value } }
    )

    if (!res.success && res.field) {
      errors.value[res.field as 'name' | 'email'] = res.message
      return
    }

    showToast(res.message || 'User updated!', 'success')
    setTimeout(() => router.push('/admin'), 1500)

  } catch (err: any) {
    showToast(err?.data?.statusMessage || 'Something went wrong', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast"
        :class="[
          'fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium',
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        ]"
      >
        {{ toast.message }}
      </div>
    </transition>

    <!-- Confirm Dialog -->
    <transition name="fade">
      <div
        v-if="confirmDialog"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4 flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Confirm Update</h3>
          </div>

          <p class="text-sm text-gray-600">
            Are you sure you want to update
            <span class="font-semibold text-gray-800">{{ name }}</span>'s details?
          </p>

          <!-- Preview of changes -->
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1">
            <p><span class="text-gray-400">Name:</span> {{ name }}</p>
            <p><span class="text-gray-400">Email:</span> {{ email }}</p>
          </div>

          <div class="flex gap-3 justify-end">
            <button
              @click="cancelUpdate"
              class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              @click="updateUser"
              class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Yes, Update
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Card -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">

      <!-- Header -->
      <div class="text-center mb-7">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
          <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-1">Edit User</h2>
        <p class="text-gray-500 text-sm">Update the user's account details below</p>
      </div>

      <div class="space-y-4">

        <!-- Name Field -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Full Name</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              v-model="name"
              type="text"
              placeholder="Enter full name"
              :class="[
                'w-full pl-9 pr-4 py-2.5 rounded-xl border text-gray-800 placeholder-gray-400 text-sm outline-none transition-all duration-200',
                errors.name
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              ]"
            />
          </div>
          <p v-if="errors.name" class="text-red-500 text-xs mt-1.5 ml-0.5 flex items-center gap-1">
            <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.name }}
          </p>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Email Address</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="Enter email address"
              :class="[
                'w-full pl-9 pr-4 py-2.5 rounded-xl border text-gray-800 placeholder-gray-400 text-sm outline-none transition-all duration-200',
                errors.email
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              ]"
            />
          </div>
          <p v-if="errors.email" class="text-red-500 text-xs mt-1.5 ml-0.5 flex items-center gap-1">
            <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.email }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          @click="askUpdate"
          :disabled="loading"
          class="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {{ loading ? 'Updating…' : 'Update User' }}
        </button>

        <!-- Back link -->
        <NuxtLink
          to="/admin"
          class="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>

      </div>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>