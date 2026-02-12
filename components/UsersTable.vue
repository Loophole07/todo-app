<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

type User = { id: number; name: string; email: string }

type Pagination = {
  page: number
  perPage: number
  totalPages: number
  total: number
}

type UsersResponse = {
  success: boolean
  users: User[]
  pagination?: Pagination | null
}

const router = useRouter()

const users = ref<User[]>([])
const loading = ref(false)
const page = ref(1)

const pagination = ref<Pagination>({
  page: 1,
  perPage: 10,
  totalPages: 1,
  total: 0
})

/* ---------------- FETCH USERS ---------------- */
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = { page: page.value, perPage: pagination.value.perPage }

    const res = await $fetch<UsersResponse>('/api/users', { params })

    users.value = res.users
    if (res.pagination) pagination.value = res.pagination

  } catch (err) {
    console.error('FETCH USERS ERROR 👉', err)
  } finally {
    loading.value = false
  }
}

/* ---------------- PAGINATION ---------------- */
const goToPage = (p: number) => {
  if (p >= 1 && p <= pagination.value.totalPages) {
    page.value = p
    fetchUsers()
  }
}

const prevPage = () => goToPage(page.value - 1)
const nextPage = () => goToPage(page.value + 1)

const pageNumbers = computed(() =>
  Array.from({ length: pagination.value.totalPages }, (_, i) => i + 1)
)

/* ---------------- DELETE USER ---------------- */
const handleDelete = async (user: User) => {
  if (!confirm(`Delete ${user.name}?`)) return

  try {
    await $fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE'
    })

    alert("User deleted")

    // reload current page after delete
    fetchUsers()

  } catch (err) {
    console.error("DELETE ERROR 👉", err)
    alert("Failed to delete user")
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 w-full">
    <table class="w-full table-auto text-sm">
      <thead>
        <tr class="border-b text-gray-600">
          <th class="py-2 text-left">ID</th>
          <th class="py-2 text-left">Name</th>
          <th class="py-2 text-left">Email</th>
          <th class="py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
          <td class="py-1 break-words">{{ user.id }}</td>
          <td class="py-1 break-words">{{ user.name }}</td>
          <td class="py-1 break-words">{{ user.email }}</td>
          <td class="py-1 flex gap-2 flex-wrap">
            <!-- Edit using NuxtLink -->
            <NuxtLink
              :to="`/admin/users/edit/${user.id}`"
              class="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            >
              Edit
            </NuxtLink>

            <!-- Delete button -->
            <button
              @click="handleDelete(user)"
              class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="loading" class="text-center text-gray-500 mt-4">Loading...</p>
    <p v-if="!loading && users.length === 0" class="text-center text-gray-500 mt-4">No users found</p>

    <div v-if="pagination.totalPages > 1" class="flex justify-between items-center mt-4 flex-wrap gap-2">
      <p class="text-sm text-gray-500">Page {{ page }} of {{ pagination.totalPages }} (Total: {{ pagination.total }})</p>
      <div class="flex gap-2 flex-wrap">
        <button @click="prevPage" :disabled="page === 1" class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40">Prev</button>
        <button v-for="num in pageNumbers" :key="num" @click="goToPage(num)" class="px-2 py-1 border rounded" :class="num === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'">{{ num }}</button>
        <button @click="nextPage" :disabled="page === pagination.totalPages" class="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40">Next</button>
      </div>
    </div>
  </div>
</template>
