// frontend/src/__tests__/views/TopicDetail.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TopicDetail from '../../views/TopicDetail.vue';

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

vi.mock('vue-router', () => ({
    useRoute:  () => ({ params: { id: 'topic-001' } }),
    useRouter: () => ({ push: vi.fn() }),
    RouterLink: { template: '<a><slot /></a>' },
}));

const mockTopic = {
    id: 'topic-001',
    title: 'How to prepare for SAT?',
    body: 'I need advice on preparation strategies.',
    authorUsername: 'alice',
    createdAt: new Date().toISOString(),
    comments: [
        {
            id: 'c1',
            body: 'Start with Khan Academy!',
            authorUsername: 'bob',
            createdAt: new Date().toISOString(),
        },
    ],
};

const mockTopicNoComments = { ...mockTopic, comments: [] };

function mountTopicDetail() {
    return mount(TopicDetail, {
        global: {
            plugins: [createPinia()],
            stubs: { RouterLink: { template: '<a><slot /></a>' } },
        },
    });
}

describe('TopicDetail.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(api.get).mockReset();
        vi.mocked(api.post).mockReset();
    });

    it('shows loading indicator before data arrives', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
        const wrapper = mountTopicDetail();
        expect(wrapper.text()).toContain('Loading');
    });

    it('renders topic title and body after load', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('How to prepare for SAT?');
        expect(wrapper.text()).toContain('I need advice on preparation strategies.');
    });

    it('renders topic author', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('alice');
    });

    it('renders existing comments', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('Start with Khan Academy!');
        expect(wrapper.text()).toContain('bob');
    });

    it('shows comment count', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('Comments (1)');
    });

    it('shows empty state when no comments', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopicNoComments });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.text()).toContain('No comments yet');
    });

    it('renders comment textarea and Post Comment button', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.find('textarea').exists()).toBe(true);
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Comment');
        expect(postBtn).toBeDefined();
    });

    it('shows validation error when posting empty comment', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        const wrapper = mountTopicDetail();
        await flushPromises();

        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Comment')!;
        await postBtn.trigger('click');

        expect(wrapper.find('.error-msg').text()).toBe('Comment cannot be empty');
        expect(vi.mocked(api.post)).not.toHaveBeenCalled();
    });

    it('posts comment and reloads topic on success', async () => {
        const updatedTopic = {
            ...mockTopic,
            comments: [
                ...mockTopic.comments,
                { id: 'c2', body: 'Great advice!', authorUsername: 'carol', createdAt: new Date().toISOString() },
            ],
        };

        vi.mocked(api.get)
            .mockResolvedValueOnce({ data: mockTopic })
            .mockResolvedValueOnce({ data: updatedTopic });
        vi.mocked(api.post).mockResolvedValue({ data: { id: 'c2' } });

        const wrapper = mountTopicDetail();
        await flushPromises();

        await wrapper.find('textarea').setValue('Great advice!');
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Comment')!;
        await postBtn.trigger('click');
        await flushPromises();

        expect(vi.mocked(api.post)).toHaveBeenCalledWith('/forum/topics/topic-001/comments', {
            body: 'Great advice!',
        });
        expect(wrapper.text()).toContain('Great advice!');
    });

    it('shows Posting... on button while in flight', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        let resolve!: (v: any) => void;
        vi.mocked(api.post).mockReturnValue(new Promise((r) => { resolve = r; }));

        const wrapper = mountTopicDetail();
        await flushPromises();

        await wrapper.find('textarea').setValue('My comment here');
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Comment')!;
        postBtn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('button').find((b) => b.text() === 'Posting...')).toBeDefined();
        resolve({ data: {} });
    });

    it('shows error when API fails on load', async () => {
        vi.mocked(api.get).mockRejectedValue({
            response: { data: { error: 'Topic not found' } },
        });
        const wrapper = mountTopicDetail();
        await flushPromises();

        expect(wrapper.find('.error-msg').text()).toBe('Topic not found');
    });

    it('shows error when posting comment fails', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopic });
        vi.mocked(api.post).mockRejectedValue({
            response: { data: { error: 'Failed to post comment' } },
        });

        const wrapper = mountTopicDetail();
        await flushPromises();

        await wrapper.find('textarea').setValue('My comment');
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Comment')!;
        await postBtn.trigger('click');
        await flushPromises();

        expect(wrapper.find('.error-msg').text()).toBe('Failed to post comment');
    });
});