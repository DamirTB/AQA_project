// frontend/src/__tests__/router/guards.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import router from '../../router';

beforeEach(async () => {
  localStorage.clear();
  await router.replace('/');
  await router.isReady();
});

afterEach(() => {
  localStorage.clear();
});

describe('Router navigation guards', () => {
  describe('requiresAuth routes', () => {
    it('redirects to /login when accessing /dashboard without a token', async () => {
      localStorage.removeItem('token');
      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('redirects to /login when accessing /exams without a token', async () => {
      localStorage.removeItem('token');
      await router.push('/exams');
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('redirects to /login when accessing /forum without a token', async () => {
      localStorage.removeItem('token');
      await router.push('/forum');
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('allows access to /dashboard when a token is present', async () => {
      localStorage.setItem('token', 'valid-token');
      await router.push('/dashboard');
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });
  });

  describe('guest routes', () => {
    it('redirects to /dashboard when accessing /login with a token', async () => {
      localStorage.setItem('token', 'valid-token');
      await router.push('/login');
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });

    it('redirects to /dashboard when accessing /register with a token', async () => {
      localStorage.setItem('token', 'valid-token');
      await router.push('/register');
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });

    it('allows access to /login when no token is present', async () => {
      localStorage.removeItem('token');
      await router.push('/login');
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('allows access to /register when no token is present', async () => {
      localStorage.removeItem('token');
      await router.push('/register');
      expect(router.currentRoute.value.path).toBe('/register');
    });
  });
});
