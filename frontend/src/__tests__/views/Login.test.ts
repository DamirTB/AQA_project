import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Login from '../../views/Login.vue';

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

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  RouterLink: { template: '<a><slot /></a>' },
}));

function mountLogin() {
  return mount(Login, {
    global: {
      plugins: [createPinia()],
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
}

describe('Login.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockPush.mockClear();
    vi.mocked(api.post).mockReset();
  });

  it('renders email and password inputs', () => {
    const wrapper = mountLogin();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('renders a submit button with the text "Login"', () => {
    const wrapper = mountLogin();
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login');
  });

  it('does not show an error message by default', () => {
    const wrapper = mountLogin();
    expect(wrapper.find('.error-msg').exists()).toBe(false);
  });

  it('calls auth.login() with the entered email and password on submit', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'tok', user: {} } });
    const wrapper = mountLogin();

    await wrapper.find('input[type="email"]').setValue('alice@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');

    expect(vi.mocked(api.post)).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'alice@example.com', password: 'password123' },
    );
  });

  it('redirects to /dashboard after a successful login', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'tok', user: {} } });
    const wrapper = mountLogin();

    await wrapper.find('input[type="email"]').setValue('alice@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error message when login fails', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Invalid email or password' } },
    });
    const wrapper = mountLogin();

    await wrapper.find('input[type="email"]').setValue('bad@example.com');
    await wrapper.find('input[type="password"]').setValue('wrong');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.error-msg').text()).toBe('Invalid email or password');
  });

  it('shows "Logging in..." on the button while the request is in flight', async () => {
    let resolveLogin!: (v: any) => void;
    vi.mocked(api.post).mockReturnValue(new Promise((r) => { resolveLogin = r; }));
    const wrapper = mountLogin();

    await wrapper.find('input[type="email"]').setValue('alice@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('button[type="submit"]').text()).toBe('Logging in...');
    resolveLogin({ data: { token: 'tok', user: {} } });
  });

  it('disables the submit button while loading', async () => {
    let resolveLogin!: (v: any) => void;
    vi.mocked(api.post).mockReturnValue(new Promise((r) => { resolveLogin = r; }));
    const wrapper = mountLogin();

    wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    resolveLogin({ data: { token: 'tok', user: {} } });
  });
});
