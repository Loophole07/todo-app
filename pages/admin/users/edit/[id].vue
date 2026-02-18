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

// Field errors from backend
const errors = ref<{ name?: string; email?: string }>({})

// ── Confirm Dialog ────────────────────────────────────────
const confirmDialog = ref(false)

const askUpdate = () => {
  errors.value = {}
  if (!name.value.trim() || !email.value.trim()) {
    if (!name.value.trim()) errors.value.name = 'Name is required'
    if (!email.value.trim()) errors.value.email = 'Email is required'
    return
  }
  confirmDialog.value = true  // show dialog only if basic fields filled
}

const cancelUpdate = () => {
  confirmDialog.value = false
}

// ── Toast ─────────────────────────────────────────────────
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

// Fetch user
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

// Update user — runs after confirmation
const updateUser = async () => {
  confirmDialog.value = false  // close dialog
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
  <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">

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
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2 rounded-full">
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
              class="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              @click="updateUser"
              class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              Yes, Update
            </button>
          </div>
        </div>
      </div>
    </transition>

    <h2 class="text-2xl font-bold mb-4 text-center">Edit User</h2>

    <div class="space-y-3">

      <!-- Name Field -->
      <div>
        <input
          v-model="name"
          type="text"
          placeholder="Name"
          :class="[
            'w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2',
            errors.name ? 'border-red-500 focus:ring-red-400' : 'focus:ring-blue-400'
          ]"
        />
        <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
      </div>

      <!-- Email Field -->
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          :class="[
            'w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2',
            errors.email ? 'border-red-500 focus:ring-red-400' : 'focus:ring-blue-400'
          ]"
        />
        <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
      </div>

      <!-- Button now triggers dialog, not updateUser directly -->
      <button
        @click="askUpdate"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
      >
        {{ loading ? 'Updating…' : 'Update User' }}
      </button>

      <NuxtLink to="/admin" class="block text-center mt-2 text-gray-600 hover:underline">
        ← Back to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>