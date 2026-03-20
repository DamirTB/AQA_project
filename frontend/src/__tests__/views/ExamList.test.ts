import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ExamList from '../../views/ExamList.vue';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../api/client';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
}));

const mockExams = [
  {
    id: 'e1',
    title: 'SAT Math',
    description: 'Math prep',
    timeLimitMinutes: 60,
    questionCount: 20,
    categoryId: 'c1',
    categoryName: 'Math',
  },
  {
    id: 'e2',
    title: 'IELTS Writing',
    description: 'Writing prep',
    timeLimitMinutes: 45,
    questionCount: 10,
    categoryId: 'c2',
    categoryName: 'English',
  },
];

const mockCategories = [
  { id: 'c1', name: 'Math' },
  { id: 'c2', name: 'English' },
];

function mountExamList() {
  return mount(ExamList, {
    global: {
      plugins: [createPinia()],
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
}

describe('ExamList.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  it('shows a loading indicator before data arrives', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    const wrapper = mountExamList();
    expect(wrapper.text()).toContain('Loading');
  });

  it('renders all exams after data loads', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: mockExams });
      if (url === '/exams/categories') return Promise.resolve({ data: mockCategories });
      if (url === '/bookmarks') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Unknown URL'));
    });

    const wrapper = mountExamList();
    await flushPromises();

    expect(wrapper.text()).toContain('SAT Math');
    expect(wrapper.text()).toContain('IELTS Writing');
  });

  it('shows an error message when the API call fails', async () => {
    vi.mocked(api.get).mockRejectedValue({
      response: { data: { error: 'Unauthorized' } },
    });

    const wrapper = mountExamList();
    await flushPromises();

    expect(wrapper.find('.error-msg').exists()).toBe(true);
    expect(wrapper.find('.error-msg').text()).toBe('Unauthorized');
  });

  it('renders category options in the filter dropdown', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: mockExams });
      if (url === '/exams/categories') return Promise.resolve({ data: mockCategories });
      if (url === '/bookmarks') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Unknown URL'));
    });

    const wrapper = mountExamList();
    await flushPromises();

    const options = wrapper.findAll('option');
    const labels = options.map((o) => o.text());
    expect(labels).toContain('Math');
    expect(labels).toContain('English');
  });

  it('filters exams by the selected category', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: mockExams });
      if (url === '/exams/categories') return Promise.resolve({ data: mockCategories });
      if (url === '/bookmarks') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Unknown URL'));
    });

    const wrapper = mountExamList();
    await flushPromises();

    await wrapper.find('select').setValue('c1');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('SAT Math');
    expect(wrapper.text()).not.toContain('IELTS Writing');
  });

  it('shows all exams when the category filter is cleared', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: mockExams });
      if (url === '/exams/categories') return Promise.resolve({ data: mockCategories });
      if (url === '/bookmarks') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Unknown URL'));
    });

    const wrapper = mountExamList();
    await flushPromises();

    await wrapper.find('select').setValue('c1');
    await wrapper.vm.$nextTick();
    await wrapper.find('select').setValue('');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('SAT Math');
    expect(wrapper.text()).toContain('IELTS Writing');
  });

  it('shows a filled star for bookmarked exams', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/exams') return Promise.resolve({ data: mockExams });
      if (url === '/exams/categories') return Promise.resolve({ data: mockCategories });
      if (url === '/bookmarks') return Promise.resolve({ data: [{ examId: 'e1' }] });
      return Promise.reject(new Error('Unknown URL'));
    });

    const wrapper = mountExamList();
    await flushPromises();

    const bookmarkButtons = wrapper.findAll('.bookmark-btn');
    expect(bookmarkButtons[0].text()).toBe('★');
    expect(bookmarkButtons[1].text()).toBe('☆');
  });
});
