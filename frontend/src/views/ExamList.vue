<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/client';

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questionCount: number;
}

const exams = ref<Exam[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const { data } = await api.get('/exams');
    exams.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load exams';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1>Available Exams</h1>
    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else>
      <div v-for="exam in exams" :key="exam.id" class="card exam-card">
        <h2>{{ exam.title }}</h2>
        <p class="exam-desc">{{ exam.description }}</p>
        <div class="exam-meta">
          <span>{{ exam.questionCount }} questions</span>
          <span>{{ exam.timeLimitMinutes }} minutes</span>
        </div>
        <router-link :to="`/exams/${exam.id}`" class="btn btn-primary">View Details</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exam-card h2 {
  margin-bottom: 8px;
}

.exam-desc {
  color: #666;
  margin-bottom: 12px;
  font-size: 14px;
}

.exam-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #888;
}
</style>
