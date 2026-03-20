import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/client';

interface User {
  id: string;
  username: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const isAuthenticated = computed(() => !!token.value);

  async function register(username: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { username, email, password });
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isAuthenticated, register, login, logout };
});
