<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/client';

const auth = useAuthStore();

interface HistoryItem {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number | null;
  totalQuestions: number;
  percentage: number | null;
  status: string;
  startedAt: string;
  submittedAt: string | null;
}

interface BookmarkItem {
  id: string;
  examId: string;
  examTitle: string;
  examDescription: string;
  timeLimitMinutes: number;
}

const history = ref<HistoryItem[]>([]);
const bookmarks = ref<BookmarkItem[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const [historyRes, bookmarksRes] = await Promise.all([
      api.get('/attempts/history'),
      api.get('/bookmarks'),
    ]);
    history.value = historyRes.data;
    bookmarks.value = bookmarksRes.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load data';
  } finally {
    loading.value = false;
  }
});

async function removeBookmark(examId: string) {
  try {
    await api.delete(`/bookmarks/${examId}`);
    bookmarks.value = bookmarks.value.filter((b) => b.examId !== examId);
  } catch {
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
    <h1>Welcome, {{ auth.user?.username }}!</h1>

    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <template v-else>
      <div v-if="bookmarks.length > 0" class="card" style="margin-bottom:24px">
        <h2>Bookmarked Exams</h2>
        <div class="bookmarks-grid">
          <div v-for="bm in bookmarks" :key="bm.id" class="bookmark-item">
            <div>
              <router-link :to="`/exams/${bm.examId}`" class="bookmark-title">{{ bm.examTitle }}</router-link>
              <div class="bookmark-meta">{{ bm.timeLimitMinutes }} min</div>
            </div>
            <button class="remove-btn" @click="removeBookmark(bm.examId)" title="Remove bookmark">&times;</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="margin-bottom:0">Exam History</h2>
          <router-link to="/exams" class="btn btn-primary">Browse Exams</router-link>
        </div>

        <div v-if="history.length === 0" style="padding:20px;text-align:center;color:#666">
          No exam attempts yet. <router-link to="/exams">Take your first exam!</router-link>
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in history" :key="item.attemptId">
              <td>{{ item.examTitle }}</td>
              <td>{{ item.score !== null ? `${item.score}/${item.totalQuestions}` : '-' }}</td>
              <td>{{ item.percentage !== null ? `${item.percentage}%` : '-' }}</td>
              <td>
                <span :class="item.status === 'completed' ? 'status-done' : 'status-progress'">
                  {{ item.status === 'completed' ? 'Completed' : 'In Progress' }}
                </span>
              </td>
              <td>{{ formatDate(item.startedAt) }}</td>
              <td>
                <router-link
                  v-if="item.status === 'completed'"
                  :to="`/results/${item.attemptId}`"
                  class="btn btn-primary"
                  style="padding:4px 12px;font-size:12px"
                >
                  View
                </router-link>
                <router-link
                  v-else
                  :to="`/attempt/${item.attemptId}`"
                  class="btn btn-primary"
                  style="padding:4px 12px;font-size:12px"
                >
                  Continue
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.status-done {
  color: #137333;
  font-weight: 500;
}

.status-progress {
  color: #e37400;
  font-weight: 500;
}

.bookmarks-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.bookmark-title {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
}

.bookmark-title:hover {
  text-decoration: underline;
}

.bookmark-meta {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.remove-btn:hover {
  color: #c5221f;
}
</style>
