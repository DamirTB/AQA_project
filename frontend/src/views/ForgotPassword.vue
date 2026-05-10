<!--frontend/src/views/ForgotPassword.vue-->
<script setup lang="ts">
import { ref } from 'vue';
import api from '../api/client';

const email = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  success.value = '';
  loading.value = true;
  try {
    const { data } = await api.post('/auth/forgot-password', { email: email.value });
    success.value = data.message;
    email.value = '';
  } catch (err: any) {
    const data = err.response?.data;
    error.value = data?.error || 'Something went wrong. Please try again.';
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
      <h1>Forgot Password</h1>
      <p class="subtitle">Enter your email address and we'll send you a link to reset your password.</p>

      <div v-if="success" class="success-msg">{{ success }}</div>
      <div v-if="error" class="error-msg">{{ error }}</div>

      <form v-if="!success" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <p class="auth-footer">
        <router-link to="/login">Back to Login</router-link>
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

.subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.success-msg {
  background: #e6f4ea;
  color: #1e7e34;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
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
