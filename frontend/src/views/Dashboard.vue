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

const history = ref<HistoryItem[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await api.get('/attempts/history');
    history.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load history';
  } finally {
    loading.value = false;
  }
});

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

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="margin-bottom:0">Exam History</h2>
        <router-link to="/exams" class="btn btn-primary">Browse Exams</router-link>
      </div>

      <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <div v-else-if="history.length === 0" style="padding:20px;text-align:center;color:#666">
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
</style>
