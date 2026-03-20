<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

async function handleRegister() {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  try {
    await auth.register(username.value, email.value, password.value);
    router.push('/dashboard');
  } catch (err: any) {
    const data = err.response?.data;
    error.value = data?.error || 'Registration failed';
    if (data?.details) {
      error.value += ': ' + data.details.join(', ');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="card auth-card">
      <h1>Register</h1>
      <div v-if="error" class="error-msg">{{ error }}</div>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" placeholder="Choose a username" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Min 6 characters" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="Repeat password" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="auth-footer">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-footer {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}

.auth-footer a {
  color: #1a73e8;
}
</style>
