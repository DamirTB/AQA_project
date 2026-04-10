import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Materials from '../../views/Materials.vue';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../api/client';

function mountMaterials() {
  return mount(Materials);
}

describe('Materials.vue', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('shows loading indicator before data arrives', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    const wrapper = mountMaterials();
    expect(wrapper.text()).toContain('Loading');
  });

  it('renders materials loaded from API', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [
        {
          id: 'm1',
          title: 'Linear Equations',
          topic: 'Math',
          level: 'beginner',
          content: 'Solve equations by isolating x.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'm2',
          title: 'Reading Comprehension',
          topic: 'English',
          level: 'intermediate',
          content: 'Read for structure and key points.',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const wrapper = mountMaterials();
    await flushPromises();

    expect(wrapper.text()).toContain('Linear Equations');
    expect(wrapper.text()).toContain('Reading Comprehension');
    expect(wrapper.text()).toContain('Beginner');
    expect(wrapper.text()).toContain('Intermediate');
  });

  it('filters materials by selected topic', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [
        {
          id: 'm1',
          title: 'Triangles',
          topic: 'Math',
          level: 'beginner',
          content: 'Triangle angles sum to 180 degrees.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'm2',
          title: 'Essay Structure',
          topic: 'English',
          level: 'intermediate',
          content: 'Use intro, body, and conclusion.',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const wrapper = mountMaterials();
    await flushPromises();

    await wrapper.find('select').setValue('Math');
    expect(wrapper.text()).toContain('Triangles');
    expect(wrapper.text()).not.toContain('Essay Structure');
  });
});
