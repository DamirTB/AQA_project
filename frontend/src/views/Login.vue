<!--frontend/src/views/Login.vue-->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push('/dashboard');
  } catch (err: any) {
    const data = err.response?.data;
    error.value = data?.error || 'Login failed';
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
      <h1>Login</h1>
      <div v-if="error" class="error-msg">{{ error }}</div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="forgot-link">
        <router-link to="/forgot-password">Forgot your password?</router-link>
      </p>
      <p class="auth-footer">
        Don't have an account? <router-link to="/register">Register</router-link>
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

.forgot-link {
  margin-top: 12px;
  text-align: right;
  font-size: 13px;
}

.forgot-link a {
  color: #1a73e8;
}
</style>
