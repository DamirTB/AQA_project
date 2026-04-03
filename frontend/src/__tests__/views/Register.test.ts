// frontend/src/__tests__/views/Register.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Register from '../../views/Register.vue';

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

function mountRegister() {
  return mount(Register, {
    global: {
      plugins: [createPinia()],
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
}

describe('Register.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockPush.mockClear();
    vi.mocked(api.post).mockReset();
  });

  it('renders username, email, password and confirm-password inputs', () => {
    const wrapper = mountRegister();
    expect(wrapper.find('input#username').exists()).toBe(true);
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('input#confirmPassword').exists()).toBe(true);
  });

  it('renders a submit button with the text "Register"', () => {
    const wrapper = mountRegister();
    expect(wrapper.find('button[type="submit"]').text()).toBe('Register');
  });

  it('shows an error when passwords do not match (without calling the API)', async () => {
    const wrapper = mountRegister();

    await wrapper.find('input#username').setValue('alice');
    await wrapper.find('input#email').setValue('alice@example.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirmPassword').setValue('different');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.find('.error-msg').text()).toBe('Passwords do not match');
    expect(vi.mocked(api.post)).not.toHaveBeenCalled();
  });

  it('calls auth.register() with the correct values when passwords match', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'tok', user: {} } });
    const wrapper = mountRegister();

    await wrapper.find('input#username').setValue('alice');
    await wrapper.find('input#email').setValue('alice@example.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirmPassword').setValue('password123');
    await wrapper.find('form').trigger('submit');

    expect(vi.mocked(api.post)).toHaveBeenCalledWith(
      '/auth/register',
      { username: 'alice', email: 'alice@example.com', password: 'password123' },
    );
  });

  it('redirects to /dashboard after a successful registration', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'tok', user: {} } });
    const wrapper = mountRegister();

    await wrapper.find('input#username').setValue('alice');
    await wrapper.find('input#email').setValue('alice@example.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirmPassword').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an API error message when registration fails', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'Email already exists' } },
    });
    const wrapper = mountRegister();

    await wrapper.find('input#username').setValue('alice');
    await wrapper.find('input#email').setValue('existing@example.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirmPassword').setValue('password123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.error-msg').text()).toBe('Email already exists');
  });

  it('shows "Registering..." on the button while loading', async () => {
    let resolve!: (v: any) => void;
    vi.mocked(api.post).mockReturnValue(new Promise((r) => { resolve = r; }));
    const wrapper = mountRegister();

    await wrapper.find('input#username').setValue('alice');
    await wrapper.find('input#email').setValue('alice@example.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirmPassword').setValue('password123');
    wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('button[type="submit"]').text()).toBe('Registering...');
    resolve({ data: { token: 'tok', user: {} } });
  });
});
