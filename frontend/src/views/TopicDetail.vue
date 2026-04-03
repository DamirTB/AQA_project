<!--frontend/src/views/TopicDetail.vue-->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api/client';

const route = useRoute();

interface Comment {
  id: string;
  body: string;
  authorUsername: string;
  createdAt: string;
}

interface TopicData {
  id: string;
  title: string;
  body: string;
  authorUsername: string;
  createdAt: string;
  comments: Comment[];
}

const topic = ref<TopicData | null>(null);
const loading = ref(true);
const error = ref('');

const newComment = ref('');
const posting = ref(false);
const commentError = ref('');

onMounted(async () => {
  await loadTopic();
});

async function loadTopic() {
  try {
    const { data } = await api.get(`/forum/topics/${route.params.id}`);
    topic.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load topic';
  } finally {
    loading.value = false;
  }
}

async function postComment() {
  commentError.value = '';
  if (!newComment.value.trim()) {
    commentError.value = 'Comment cannot be empty';
    return;
  }

  posting.value = true;
  try {
    await api.post(`/forum/topics/${route.params.id}/comments`, {
      body: newComment.value.trim(),
    });
    newComment.value = '';
    await loadTopic();
  } catch (err: any) {
    const data = err.response?.data;
    commentError.value = data?.error || 'Failed to post comment';
  } finally {
    posting.value = false;
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
    <router-link to="/forum" style="color:#1a73e8;font-size:14px;text-decoration:none">&larr; Back to Forum</router-link>

    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="topic">
      <div class="card" style="margin-top:12px">
        <h1>{{ topic.title }}</h1>
        <div class="topic-meta">
          <span>by {{ topic.authorUsername }}</span>
          <span>{{ formatDate(topic.createdAt) }}</span>
        </div>
        <p class="topic-body">{{ topic.body }}</p>
      </div>

      <h2>Comments ({{ topic.comments.length }})</h2>

      <div v-if="topic.comments.length === 0" class="card" style="text-align:center;color:#666">
        No comments yet. Be the first to reply!
      </div>

      <div v-for="comment in topic.comments" :key="comment.id" class="card comment-card">
        <div class="comment-header">
          <span class="comment-author">{{ comment.authorUsername }}</span>
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <p class="comment-body">{{ comment.body }}</p>
      </div>

      <div class="card">
        <h3 style="margin-bottom:12px">Add a Comment</h3>
        <div v-if="commentError" class="error-msg">{{ commentError }}</div>
        <div class="form-group">
          <textarea
            v-model="newComment"
            placeholder="Write your comment..."
            class="textarea"
            rows="3"
          ></textarea>
        </div>
        <button class="btn btn-primary" :disabled="posting" @click="postComment">
          {{ posting ? 'Posting...' : 'Post Comment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topic-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
}

.topic-body {
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.comment-card {
  padding: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
}

.comment-date {
  font-size: 12px;
  color: #aaa;
}

.comment-body {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

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
</style>
