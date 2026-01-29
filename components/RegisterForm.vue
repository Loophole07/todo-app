<template>
  <form @submit.prevent="registerUser" class="space-y-4">
    <input
      v-model="name"
      type="text"
      placeholder="Name"
      class="input"
    />
    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="input"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      class="input"
    />
    <button type="submit" class="btn">Register</button>

    <p v-if="message" :class="{'text-green-600': success, 'text-red-600': !success}">
      {{ message }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const password = ref('');
const message = ref('');
const success = ref(false);

interface RegisterResponse {
  success: boolean;
  message: string;
}

const registerUser = async () => {
  try {
    // ✅ Use $fetch for client-side POST requests
    const data: RegisterResponse = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value },
    });

    message.value = data.message;
    success.value = data.success;

    if (success.value) {
      name.value = '';
      email.value = '';
      password.value = '';
    }
  } catch (err) {
    console.error('Register error:', err);
    message.value = 'Server error. Check server logs.';
    success.value = false;
  }
};
</script>

<style>
.input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}
.btn {
  width: 100%;
  padding: 0.5rem 0;
  border-radius: 0.5rem;
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
}
.btn:hover {
  background-color: #4338ca;
}
</style>
