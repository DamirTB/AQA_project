// frontend/src/__tests__/views/Dashboard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('../../config/uiFeatures', () => ({
  showForum: true,
  showBookmarks: true,
  showReviews: true,
}));

import Dashboard from '../../views/Dashboard.vue';

vi.mock('../../api/client', () => ({
    default: {
        get: vi.fn(),
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

const mockHistory = [
    {
        attemptId: 'a1',
        examId: 'e1',
        examTitle: 'SAT Math',
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        status: 'completed',
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
    },
    {
        attemptId: 'a2',
        examId: 'e2',
        examTitle: 'IELTS',
        score: null,
        totalQuestions: 5,
        percentage: null,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        submittedAt: null,
    },
];

const mockBookmarks = [
    {
        id: 'b1',
        examId: 'e1',
        examTitle: 'SAT Math',
        examDescription: 'Math prep',
        timeLimitMinutes: 60,
    },
];

function mountDashboard() {
    return mount(Dashboard, {
        global: {
            plugins: [createPinia()],
            stubs: { RouterLink: { template: '<a><slot /></a>' } },
        },
    });
}

describe('Dashboard.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(api.get).mockReset();
        vi.mocked(api.delete).mockReset();
    });

    it('shows loading indicator before data arrives', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
        const wrapper = mountDashboard();
        expect(wrapper.text()).toContain('Loading');
    });

    it('renders exam history after load', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockHistory })
            .mockResolvedValueOnce({ data: mockBookmarks });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.text()).toContain('SAT Math');
        expect(wrapper.text()).toContain('IELTS');
    });

    it('shows Completed badge for completed attempts', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockHistory })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.text()).toContain('Completed');
    });

    it('shows In Progress badge for in-progress attempts', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockHistory })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.text()).toContain('In Progress');
    });

    it('shows score as fraction for completed attempts', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockHistory })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.text()).toContain('8/10');
    });

    it('shows dash for score when attempt is in progress', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockHistory })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountDashboard();
        await flushPromises();

        const cells = wrapper.findAll('td');
        const dashCell = cells.find((c) => c.text() === '-');
        expect(dashCell).toBeDefined();
    });

    it('renders bookmarked exams section when bookmarks exist', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: mockBookmarks });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.text()).toContain('Bookmarked Exams');
        expect(wrapper.text()).toContain('SAT Math');
    });

    it('removes bookmark from list after clicking remove button', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: mockBookmarks });
        vi.mocked(api.delete).mockResolvedValue({});

        const wrapper = mountDashboard();
        await flushPromises();

        await wrapper.find('.remove-btn').trigger('click');
        await flushPromises();

        expect(vi.mocked(api.delete)).toHaveBeenCalledWith('/bookmarks/e1');
        expect(wrapper.text()).not.toContain('Bookmarked Exams');
    });

    it('shows empty history message when no attempts exist', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.text()).toContain('No exam attempts yet');
    });

    it('shows error message when API call fails', async () => {
        vi.mocked(api.get).mockRejectedValue({
            response: { data: { error: 'Unauthorized' } },
        });

        const wrapper = mountDashboard();
        await flushPromises();

        expect(wrapper.find('.error-msg').exists()).toBe(true);
        expect(wrapper.find('.error-msg').text()).toBe('Unauthorized');
    });
});