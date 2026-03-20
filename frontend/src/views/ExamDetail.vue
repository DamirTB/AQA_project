<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/client';

const route = useRoute();
const router = useRouter();

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questionCount: number;
}

const exam = ref<Exam | null>(null);
const loading = ref(true);
const starting = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await api.get(`/exams/${route.params.id}`);
    exam.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load exam';
  } finally {
    loading.value = false;
  }
});

async function startExam() {
  if (!exam.value) return;
  starting.value = true;
  try {
    const { data } = await api.post('/attempts/start', { examId: exam.value.id });
    router.push(`/attempt/${data.attemptId}`);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to start exam';
  } finally {
    starting.value = false;
  }
}
</script>

<template>
  <div>
    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="exam" class="card">
      <h1>{{ exam.title }}</h1>
      <p style="color:#666;margin-bottom:20px">{{ exam.description }}</p>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Questions</div>
          <div class="detail-value">{{ exam.questionCount }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Time Limit</div>
          <div class="detail-value">{{ exam.timeLimitMinutes }} minutes</div>
        </div>
      </div>
      <div style="margin-top:24px;display:flex;gap:12px">
        <button @click="startExam" class="btn btn-primary" :disabled="starting">
          {{ starting ? 'Starting...' : 'Begin Exam' }}
        </button>
        <router-link to="/exams" class="btn" style="background:#eee;color:#333">Back to Exams</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-grid {
  display: flex;
  gap: 32px;
}

.detail-item {
  background: #f8f9fa;
  padding: 16px 24px;
  border-radius: 6px;
}

.detail-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 20px;
  font-weight: 600;
}
</style>
