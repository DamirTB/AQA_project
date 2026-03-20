import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../stores/auth';

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../api/client';

const mockToken = 'mock-jwt-token';
const mockUser = { id: '1', username: 'alice', email: 'alice@example.com' };

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.mocked(api.post).mockReset();
  });

  describe('login()', () => {
    it('stores token and user in state after successful login', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });

      const store = useAuthStore();
      await store.login('alice@example.com', 'password123');

      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
    });

    it('saves token and user to localStorage', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });

      const store = useAuthStore();
      await store.login('alice@example.com', 'password123');

      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
    });

    it('throws when the API returns an error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

      const store = useAuthStore();
      await expect(store.login('wrong@example.com', 'bad')).rejects.toThrow();
    });
  });

  describe('register()', () => {
    it('stores token and user in state after successful registration', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });

      const store = useAuthStore();
      await store.register('alice', 'alice@example.com', 'password123');

      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
    });

    it('saves token and user to localStorage', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });

      const store = useAuthStore();
      await store.register('alice', 'alice@example.com', 'password123');

      expect(localStorage.getItem('token')).toBe(mockToken);
    });
  });

  describe('logout()', () => {
    it('clears token and user from state', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });
      const store = useAuthStore();
      await store.login('alice@example.com', 'password123');

      store.logout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
    });

    it('removes token and user from localStorage', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });
      const store = useAuthStore();
      await store.login('alice@example.com', 'password123');

      store.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token is set', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });

    it('returns true after a successful login', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });
      const store = useAuthStore();
      await store.login('alice@example.com', 'password123');

      expect(store.isAuthenticated).toBe(true);
    });

    it('returns false after logout', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { token: mockToken, user: mockUser } });
      const store = useAuthStore();
      await store.login('alice@example.com', 'password123');
      store.logout();

      expect(store.isAuthenticated).toBe(false);
    });

    it('returns true when a token is already present in localStorage on store init', () => {
      localStorage.setItem('token', mockToken);
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(true);
    });
  });
});
