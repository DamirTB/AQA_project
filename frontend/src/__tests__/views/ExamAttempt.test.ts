// frontend/src/__tests__/views/ExamAttempt.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ExamAttempt from '../../views/ExamAttempt.vue';

// ── Mock API client ──────────────────────────────────────────────────────────
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

// ── Mock vue-router ──────────────────────────────────────────────────────────
const mockPush    = vi.fn();
const mockReplace = vi.fn();

vi.mock('vue-router', () => ({
    useRoute:  () => ({ params: { id: 'attempt-abc' } }),
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// ── Shared test fixtures ─────────────────────────────────────────────────────
const historyInProgress = [
    { attemptId: 'attempt-abc', examId: 'exam-001', status: 'in_progress' },
];

const startResponse = {
    attemptId: 'attempt-abc',
    exam: { id: 'exam-001', title: 'SAT Math', timeLimitMinutes: 60 },
    startedAt: new Date().toISOString(),
    answers: {},
    questions: [
        { id: 'q1', text: 'What is 2 + 2?',  options: ['1', '2', '3', '4'], order: 0 },
        { id: 'q2', text: 'What is 10 / 2?', options: ['3', '4', '5', '6'], order: 1 },
    ],
};

function mountComponent() {
    return mount(ExamAttempt, {
        global: { plugins: [createPinia()] },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
describe('ExamAttempt.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(api.get).mockReset();
        vi.mocked(api.post).mockReset();
        mockPush.mockClear();
        mockReplace.mockClear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Loading state ──────────────────────────────────────────────────────────
    describe('Loading state', () => {
        it('shows a loading indicator before data arrives', () => {
            vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // never resolves
            const wrapper = mountComponent();
            expect(wrapper.text()).toContain('Loading exam');
        });
    });

    // ── Successful load ────────────────────────────────────────────────────────
    describe('Successful data load', () => {
        beforeEach(() => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });
            vi.mocked(api.post).mockResolvedValue({ data: startResponse });
        });

        it('renders the exam title', async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.text()).toContain('SAT Math');
        });

        it('renders all question texts', async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.text()).toContain('What is 2 + 2?');
            expect(wrapper.text()).toContain('What is 10 / 2?');
        });

        it('renders 8 radio buttons (2 questions × 4 options)', async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.findAll('input[type="radio"]')).toHaveLength(8);
        });

        it('displays the timer in MM:SS format', async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find('.timer').text()).toMatch(/^\d+:\d{2}$/);
        });

        it('shows "0/2 answered" before any selection', async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.text()).toContain('0/2 answered');
        });

        it('renders a "Submit Exam" button', async () => {
            const wrapper = mountComponent();
            await flushPromises();
            expect(wrapper.find('button').text()).toBe('Submit Exam');
        });
    });

    // ── Answer selection ───────────────────────────────────────────────────────
    describe('Answer selection', () => {
        beforeEach(() => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });
            vi.mocked(api.post).mockResolvedValue({ data: startResponse });
        });

        it('increments "answered" count when an option is selected', async () => {
            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.find('input[type="radio"]').trigger('change');
            expect(wrapper.text()).toContain('1/2 answered');
        });

        it('applies the "selected" CSS class to the chosen option', async () => {
            const wrapper = mountComponent();
            await flushPromises();

            const firstOption = wrapper.find('.option');
            const firstRadio  = wrapper.find('input[type="radio"]');
            await firstRadio.trigger('change');

            expect(firstOption.classes()).toContain('selected');
        });

        it('allows selecting different options for different questions', async () => {
            const wrapper = mountComponent();
            await flushPromises();

            const radios = wrapper.findAll('input[type="radio"]');
            await radios[0].trigger('change'); // Q1 → option 0
            await radios[4].trigger('change'); // Q2 → option 0

            expect(wrapper.text()).toContain('2/2 answered');
        });
    });

    // ── Submit flow ────────────────────────────────────────────────────────────
    describe('Submit flow', () => {
        it('shows "Submitting..." and disables button while in flight', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });

            let resolveSubmit!: (v: any) => void;
            vi.mocked(api.post)
                .mockResolvedValueOnce({ data: startResponse })            // start
                .mockReturnValueOnce(new Promise((r) => { resolveSubmit = r; })); // submit

            const wrapper = mountComponent();
            await flushPromises();

            wrapper.find('button').trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('button').text()).toBe('Submitting...');
            expect(wrapper.find('button').attributes('disabled')).toBeDefined();

            // Resolve so the test doesn't leak
            resolveSubmit({ data: { attemptId: 'attempt-abc' } });
        });

        it('navigates to /results/:id after a successful submit', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });
            vi.mocked(api.post)
                .mockResolvedValueOnce({ data: startResponse })
                .mockResolvedValueOnce({ data: { attemptId: 'attempt-abc' } });

            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.find('button').trigger('click');
            await flushPromises();

            expect(mockPush).toHaveBeenCalledWith('/results/attempt-abc');
        });

        it('shows an error message when submission fails', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });
            vi.mocked(api.post)
                .mockResolvedValueOnce({ data: startResponse })
                .mockRejectedValueOnce({
                    response: { data: { error: 'Time limit exceeded' } },
                });

            const wrapper = mountComponent();
            await flushPromises();

            await wrapper.find('button').trigger('click');
            await flushPromises();

            expect(wrapper.find('.error-msg').exists()).toBe(true);
            expect(wrapper.find('.error-msg').text()).toBe('Time limit exceeded');
        });

        it('does not submit twice if button is already disabled', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });

            let resolveSubmit!: (v: any) => void;
            vi.mocked(api.post)
                .mockResolvedValueOnce({ data: startResponse })
                .mockReturnValueOnce(new Promise((r) => { resolveSubmit = r; }));

            const wrapper = mountComponent();
            await flushPromises();

            // Click twice — second click must be ignored (button is disabled)
            wrapper.find('button').trigger('click');
            await wrapper.vm.$nextTick();
            wrapper.find('button').trigger('click');
            await wrapper.vm.$nextTick();

            // api.post should have been called only once for submit
            expect(vi.mocked(api.post)).toHaveBeenCalledTimes(2); // 1 start + 1 submit

            resolveSubmit({ data: { attemptId: 'attempt-abc' } });
        });
    });

    // ── Error paths ────────────────────────────────────────────────────────────
    describe('Error paths', () => {
        it('shows error when the history API call fails', async () => {
            vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

            const wrapper = mountComponent();
            await flushPromises();

            expect(wrapper.find('.error-msg').exists()).toBe(true);
        });

        it('redirects to /results/:id when attempt is already completed', async () => {
            vi.mocked(api.get).mockResolvedValue({
                data: [{ attemptId: 'attempt-abc', examId: 'exam-001', status: 'completed' }],
            });

            mountComponent();
            await flushPromises();

            expect(mockReplace).toHaveBeenCalledWith('/results/attempt-abc');
        });
    });

    // ── Timer behaviour ────────────────────────────────────────────────────────
    describe('Timer', () => {
        it('applies timer-warning class when less than 60 seconds remain', async () => {
            // Simulate exam started ~59 minutes 5 seconds ago → 55 sec left
            const nearEnd = new Date(Date.now() - (60 * 60 - 55) * 1000).toISOString();

            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });
            vi.mocked(api.post).mockResolvedValue({
                data: { ...startResponse, startedAt: nearEnd },
            });

            const wrapper = mountComponent();
            await flushPromises();

            expect(wrapper.find('.timer').classes()).toContain('timer-warning');
        });

        it('updates the countdown every second', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: historyInProgress });
            vi.mocked(api.post).mockResolvedValue({ data: startResponse });

            const wrapper = mountComponent();
            await flushPromises();

            const before = wrapper.find('.timer').text();
            vi.advanceTimersByTime(1000);
            await wrapper.vm.$nextTick();
            const after = wrapper.find('.timer').text();

            // After 1 second the displayed time should differ
            expect(before).not.toBe(after);
        });
    });
});