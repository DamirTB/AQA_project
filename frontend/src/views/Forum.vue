<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/client';

interface Topic {
  id: string;
  title: string;
  body: string;
  authorUsername: string;
  commentCount: number;
  createdAt: string;
}

const topics = ref<Topic[]>([]);
const loading = ref(true);
const error = ref('');

const showForm = ref(false);
const newTitle = ref('');
const newBody = ref('');
const creating = ref(false);
const formError = ref('');

onMounted(async () => {
  await loadTopics();
});

async function loadTopics() {
  try {
    const { data } = await api.get('/forum/topics');
    topics.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load topics';
  } finally {
    loading.value = false;
  }
}

async function createTopic() {
  formError.value = '';
  if (newTitle.value.trim().length < 3) {
    formError.value = 'Title must be at least 3 characters';
    return;
  }
  if (newBody.value.trim().length < 10) {
    formError.value = 'Body must be at least 10 characters';
    return;
  }

  creating.value = true;
  try {
    await api.post('/forum/topics', {
      title: newTitle.value.trim(),
      body: newBody.value.trim(),
    });
    newTitle.value = '';
    newBody.value = '';
    showForm.value = false;
    loading.value = true;
    await loadTopics();
  } catch (err: any) {
    const data = err.response?.data;
    formError.value = data?.error || 'Failed to create topic';
    if (data?.details) formError.value += ': ' + data.details.join(', ');
  } finally {
    creating.value = false;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h1 style="margin-bottom:0">Forum</h1>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'New Topic' }}
      </button>
    </div>

    <div v-if="showForm" class="card">
      <h2>Create New Topic</h2>
      <div v-if="formError" class="error-msg">{{ formError }}</div>
      <div class="form-group">
        <label for="topic-title">Title</label>
        <input id="topic-title" v-model="newTitle" type="text" placeholder="Topic title (min 3 chars)" />
      </div>
      <div class="form-group">
        <label for="topic-body">Body</label>
        <textarea
          id="topic-body"
          v-model="newBody"
          placeholder="Write your topic (min 10 chars)..."
          class="textarea"
          rows="4"
        ></textarea>
      </div>
      <button class="btn btn-primary" :disabled="creating" @click="createTopic">
        {{ creating ? 'Posting...' : 'Post Topic' }}
      </button>
    </div>

    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="topics.length === 0" class="card" style="text-align:center;color:#666">
      No topics yet. Be the first to start a discussion!
    </div>
    <div v-else>
      <router-link
        v-for="topic in topics"
        :key="topic.id"
        :to="`/forum/${topic.id}`"
        class="card topic-card"
        style="display:block;text-decoration:none;color:inherit"
      >
        <div class="topic-header">
          <h3 class="topic-title">{{ topic.title }}</h3>
          <span class="topic-comments">{{ topic.commentCount }} comments</span>
        </div>
        <p class="topic-preview">{{ topic.body.length > 150 ? topic.body.slice(0, 150) + '...' : topic.body }}</p>
        <div class="topic-meta">
          <span>by {{ topic.authorUsername }}</span>
          <span>{{ formatDate(topic.createdAt) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.textarea:focus {
  outline: none;
  border-color: #1a73e8;
}

.topic-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.topic-title {
  font-size: 16px;
  margin: 0;
}

.topic-comments {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
}

.topic-preview {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.topic-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #aaa;
}
</style>
