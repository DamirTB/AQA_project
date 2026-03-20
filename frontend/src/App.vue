<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div id="app">
    <nav v-if="auth.isAuthenticated" class="navbar">
      <div class="nav-brand">Exam Platform</div>
      <div class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/exams">Exams</router-link>
        <span class="nav-user">{{ auth.user?.username }}</span>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

.navbar {
  background: #1a73e8;
  color: white;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-weight: 700;
  font-size: 18px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.nav-links a.router-link-active {
  text-decoration: underline;
}

.nav-user {
  font-size: 14px;
  opacity: 0.8;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.btn-primary {
  background: #1a73e8;
  color: white;
}

.btn-primary:hover {
  background: #1557b0;
}

.btn-primary:disabled {
  background: #93baf5;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #1a73e8;
}

.error-msg {
  background: #fce8e6;
  color: #c5221f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.success-msg {
  background: #e6f4ea;
  color: #137333;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
}

h1 {
  margin-bottom: 24px;
  font-size: 24px;
}

h2 {
  margin-bottom: 16px;
  font-size: 20px;
}
</style>
