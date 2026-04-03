// frontend/src/__tests__/views/Results.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Results from '../../views/Results.vue';

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

vi.mock('vue-router', () => ({
    useRoute:  () => ({ params: { id: 'attempt-001' } }),
    useRouter: () => ({ push: vi.fn() }),
    RouterLink: { template: '<a><slot /></a>' },
}));

const mockResult = {
    attemptId: 'attempt-001',
    examTitle: 'SAT Math',
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    submittedAt: new Date().toISOString(),
    breakdown: [
        {
            questionId: 'q1',
            questionText: 'What is 2 + 2?',
            options: ['1', '2', '3', '4'],
            selectedOption: 3,
            correctOption: 3,
            isCorrect: true,
        },
        {
            questionId: 'q2',
            questionText: 'What is 5 × 5?',
            options: ['20', '25', '30', '35'],
            selectedOption: 0,
            correctOption: 1,
            isCorrect: false,
        },
    ],
};

const mockFailResult = {
    ...mockResult,
    score: 3,
    percentage: 30,
};

function mountResults() {
    return mount(Results, {
        global: {
            plugins: [createPinia()],
            stubs: { RouterLink: { template: '<a><slot /></a>' } },
        },
    });
}

describe('Results.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(api.get).mockReset();
    });

    it('shows loading indicator before data arrives', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
        const wrapper = mountResults();
        expect(wrapper.text()).toContain('Loading results');
    });

    it('renders exam title in results', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('SAT Math');
    });

    it('renders score percentage', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('80%');
    });

    it('renders score fraction', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('8');
        expect(wrapper.text()).toContain('10');
    });

    it('shows congratulations message when score >= 70%', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('Congratulations');
    });

    it('shows failure message when score < 70%', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockFailResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('did not pass');
    });

    it('renders question breakdown items', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('What is 2 + 2?');
        expect(wrapper.text()).toContain('What is 5 × 5?');
    });

    it('shows Correct badge for correct answers', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.findAll('.badge-correct').length).toBeGreaterThan(0);
    });

    it('shows Incorrect badge for wrong answers', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.findAll('.badge-wrong').length).toBeGreaterThan(0);
    });

    it('renders "Back to Dashboard" and "Try Another Exam" links', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.text()).toContain('Back to Dashboard');
        expect(wrapper.text()).toContain('Try Another Exam');
    });

    it('shows error message when API fails', async () => {
        vi.mocked(api.get).mockRejectedValue({
            response: { data: { error: 'Not found' } },
        });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.find('.error-msg').exists()).toBe(true);
        expect(wrapper.find('.error-msg').text()).toBe('Not found');
    });

    it('applies score-pass class when percentage >= 70', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.find('.score-circle').classes()).toContain('score-pass');
    });

    it('applies score-fail class when percentage < 70', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockFailResult });
        const wrapper = mountResults();
        await flushPromises();

        expect(wrapper.find('.score-circle').classes()).toContain('score-fail');
    });
});