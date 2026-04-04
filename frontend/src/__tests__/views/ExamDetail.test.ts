import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ExamDetail from '../../views/ExamDetail.vue';

vi.mock('../../api/client', () => ({
    default: {
        get: vi.fn(),
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
    useRoute:  () => ({ params: { id: 'exam-001' } }),
    useRouter: () => ({ push: mockPush }),
    RouterLink: { template: '<a><slot /></a>' },
}));

const mockExam = {
    id: 'exam-001',
    title: 'SAT Math',
    description: 'Math preparation test',
    timeLimitMinutes: 60,
    questionCount: 20,
    categoryName: 'Math',
};

const mockReviews = [
    {
        id: 'r1',
        username: 'alice',
        rating: 5,
        comment: 'Great exam!',
        createdAt: new Date().toISOString(),
    },
];

function mountExamDetail() {
    return mount(ExamDetail, {
        global: {
            plugins: [createPinia()],
            stubs: { RouterLink: { template: '<a><slot /></a>' } },
        },
    });
}

describe('ExamDetail.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(api.get).mockReset();
        vi.mocked(api.post).mockReset();
        mockPush.mockClear();
        localStorage.clear();
    });

    it('shows loading indicator before data arrives', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
        const wrapper = mountExamDetail();
        expect(wrapper.text()).toContain('Loading');
    });

    it('renders exam title and description after load', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: mockReviews })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('SAT Math');
        expect(wrapper.text()).toContain('Math preparation test');
    });

    it('renders exam metadata — questions and time limit', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('20');
        expect(wrapper.text()).toContain('60 minutes');
    });

    it('renders a "Begin Exam" button', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.find('button').text()).toBe('Begin Exam');
    });

    it('navigates to /attempt/:id after clicking Begin Exam', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });
        vi.mocked(api.post).mockResolvedValue({ data: { attemptId: 'attempt-xyz' } });

        const wrapper = mountExamDetail();
        await flushPromises();

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(mockPush).toHaveBeenCalledWith('/attempt/attempt-xyz');
    });

    it('shows Starting... on button while in flight', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        let resolve!: (v: any) => void;
        vi.mocked(api.post).mockReturnValue(new Promise((r) => { resolve = r; }));

        const wrapper = mountExamDetail();
        await flushPromises();

        wrapper.find('button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('button').text()).toBe('Starting...');
        resolve({ data: { attemptId: 'x' } });
    });

    it('renders existing reviews', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: mockReviews })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('Great exam!');
        expect(wrapper.text()).toContain('alice');
    });

    it('shows "No reviews yet" when there are none', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('No reviews yet');
    });

    it('shows error message when API fails', async () => {
        vi.mocked(api.get).mockRejectedValue({
            response: { data: { error: 'Not found' } },
        });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.find('.error-msg').exists()).toBe(true);
        expect(wrapper.find('.error-msg').text()).toBe('Not found');
    });

    it('shows review form when user has completed the exam', async () => {
        localStorage.setItem('user', JSON.stringify({ username: 'bob' }));

        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({
                data: [{ attemptId: 'a1', examId: 'exam-001', status: 'completed' }],
            });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('Write a Review');
    });

    it('does not show review form when user has not completed the exam', async () => {
        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        const wrapper = mountExamDetail();
        await flushPromises();

        expect(wrapper.text()).not.toContain('Write a Review');
    });

    it('shows validation error when submitting review without comment', async () => {
        localStorage.setItem('user', JSON.stringify({ username: 'bob' }));

        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockExam })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({
                data: [{ attemptId: 'a1', examId: 'exam-001', status: 'completed' }],
            });

        const wrapper = mountExamDetail();
        await flushPromises();

        const submitBtn = wrapper.findAll('button').find((b) => b.text() === 'Submit Review');
        await submitBtn!.trigger('click');

        expect(wrapper.find('.error-msg').text()).toBe('Please write a comment');
        expect(vi.mocked(api.post)).not.toHaveBeenCalled();
    });
});