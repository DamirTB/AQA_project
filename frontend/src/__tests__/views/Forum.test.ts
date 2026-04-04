import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Forum from '../../views/Forum.vue';

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
    useRouter: () => ({ push: vi.fn() }),
    RouterLink: { template: '<a href="#"><slot /></a>' },
}));

const mockTopics = [
    {
        id: 't1',
        title: 'How to prepare for SAT?',
        body: 'I have been studying for 3 months and need advice on what to focus on.',
        authorUsername: 'alice',
        commentCount: 3,
        createdAt: new Date().toISOString(),
    },
    {
        id: 't2',
        title: 'IELTS vs TOEFL',
        body: 'Which exam is easier for non-native speakers to pass at a high level?',
        authorUsername: 'bob',
        commentCount: 0,
        createdAt: new Date().toISOString(),
    },
];

function mountForum() {
    return mount(Forum, {
        global: {
            plugins: [createPinia()],
            stubs: { RouterLink: { template: '<a href="#"><slot /></a>' } },
        },
    });
}

describe('Forum.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(api.get).mockReset();
        vi.mocked(api.post).mockReset();
    });

    it('shows loading indicator before topics arrive', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
        const wrapper = mountForum();
        expect(wrapper.text()).toContain('Loading');
    });

    it('renders all topics after load', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopics });
        const wrapper = mountForum();
        await flushPromises();

        expect(wrapper.text()).toContain('How to prepare for SAT?');
        expect(wrapper.text()).toContain('IELTS vs TOEFL');
    });

    it('shows comment count for each topic', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopics });
        const wrapper = mountForum();
        await flushPromises();

        expect(wrapper.text()).toContain('3 comments');
        expect(wrapper.text()).toContain('0 comments');
    });

    it('shows author name for each topic', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: mockTopics });
        const wrapper = mountForum();
        await flushPromises();

        expect(wrapper.text()).toContain('alice');
        expect(wrapper.text()).toContain('bob');
    });

    it('shows empty state when no topics exist', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] });
        const wrapper = mountForum();
        await flushPromises();

        expect(wrapper.text()).toContain('No topics yet');
    });

    it('shows error message when API fails', async () => {
        vi.mocked(api.get).mockRejectedValue({
            response: { data: { error: 'Unauthorized' } },
        });
        const wrapper = mountForum();
        await flushPromises();

        expect(wrapper.find('.error-msg').exists()).toBe(true);
    });

    it('renders "New Topic" button', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] });
        const wrapper = mountForum();
        await flushPromises();

        const btn = wrapper.findAll('button').find((b) => b.text() === 'New Topic');
        expect(btn).toBeDefined();
    });

    it('shows topic form when "New Topic" is clicked', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] });
        const wrapper = mountForum();
        await flushPromises();

        const btn = wrapper.findAll('button').find((b) => b.text() === 'New Topic')!;
        await btn.trigger('click');

        expect(wrapper.text()).toContain('Create New Topic');
        expect(wrapper.find('input#topic-title').exists()).toBe(true);
        expect(wrapper.find('textarea#topic-body').exists()).toBe(true);
    });

    it('shows validation error when title is too short', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] });
        const wrapper = mountForum();
        await flushPromises();

        const newTopicBtn = wrapper.findAll('button').find((b) => b.text() === 'New Topic')!;
        await newTopicBtn.trigger('click');

        await wrapper.find('input#topic-title').setValue('ab');
        await wrapper.find('textarea#topic-body').setValue('This is a long enough body');
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Topic')!;
        await postBtn.trigger('click');

        expect(wrapper.find('.error-msg').text()).toContain('Title must be at least 3 characters');
        expect(vi.mocked(api.post)).not.toHaveBeenCalled();
    });

    it('shows validation error when body is too short', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] });
        const wrapper = mountForum();
        await flushPromises();

        const newTopicBtn = wrapper.findAll('button').find((b) => b.text() === 'New Topic')!;
        await newTopicBtn.trigger('click');

        await wrapper.find('input#topic-title').setValue('Valid Title');
        await wrapper.find('textarea#topic-body').setValue('Short');
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Topic')!;
        await postBtn.trigger('click');

        expect(wrapper.find('.error-msg').text()).toContain('Body must be at least 10 characters');
        expect(vi.mocked(api.post)).not.toHaveBeenCalled();
    });

    it('creates topic and hides form on success', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: [] });
        vi.mocked(api.post).mockResolvedValue({ data: { id: 't3' } });

        const wrapper = mountForum();
        await flushPromises();

        const newTopicBtn = wrapper.findAll('button').find((b) => b.text() === 'New Topic')!;
        await newTopicBtn.trigger('click');

        await wrapper.find('input#topic-title').setValue('My New Topic');
        await wrapper.find('textarea#topic-body').setValue('This is a detailed body for the new topic.');
        const postBtn = wrapper.findAll('button').find((b) => b.text() === 'Post Topic')!;
        await postBtn.trigger('click');
        await flushPromises();

        expect(vi.mocked(api.post)).toHaveBeenCalledWith('/forum/topics', {
            title: 'My New Topic',
            body: 'This is a detailed body for the new topic.',
        });
        expect(wrapper.find('input#topic-title').exists()).toBe(false);
    });
});