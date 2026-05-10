<!--frontend/src/views/ResetPassword.vue-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/client';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);
const token = ref('');

onMounted(() => {
  token.value = (route.query.token as string) || '';
  if (!token.value) {
    error.value = 'Invalid or missing reset token. Please request a new password reset.';
  }
});

async function handleSubmit() {
  error.value = '';
  success.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    const { data } = await api.post('/auth/reset-password', {
      token: token.value,
      password: password.value,
    });
    success.value = data.message;
    setTimeout(() => router.push('/login'), 2500);
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
      <h1>Reset Password</h1>

      <div v-if="success" class="success-msg">
        {{ success }} Redirecting to login...
      </div>
      <div v-if="error && !success" class="error-msg">{{ error }}</div>

      <form v-if="token && !success" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="password">New Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter new password"
            minlength="6"
            required
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            minlength="6"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
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
