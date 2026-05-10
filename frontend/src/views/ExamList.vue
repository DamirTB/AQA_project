<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../api/client';
import { showBookmarks } from '../config/uiFeatures';

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questionCount: number;
  categoryId: string | null;
  categoryName: string | null;
}

interface Category {
  id: string;
  name: string;
}

const exams = ref<Exam[]>([]);
const categories = ref<Category[]>([]);
const bookmarkedIds = ref<Set<string>>(new Set());
const selectedCategory = ref('');
const loading = ref(true);
const error = ref('');

const filteredExams = computed(() => {
  if (!selectedCategory.value) return exams.value;
  return exams.value.filter((e) => e.categoryId === selectedCategory.value);
});

onMounted(async () => {
  try {
    const [examsRes, catsRes] = await Promise.all([api.get('/exams'), api.get('/exams/categories')]);
    exams.value = examsRes.data;
    categories.value = catsRes.data;
    if (showBookmarks) {
      const bookRes = await api.get('/bookmarks');
      bookmarkedIds.value = new Set(bookRes.data.map((b: { examId: string }) => b.examId));
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load exams';
  } finally {
    loading.value = false;
  }
});

async function toggleBookmark(examId: string) {
  if (!showBookmarks) return;
  try {
    if (bookmarkedIds.value.has(examId)) {
      await api.delete(`/bookmarks/${examId}`);
      bookmarkedIds.value.delete(examId);
      bookmarkedIds.value = new Set(bookmarkedIds.value);
    } else {
      await api.post('/bookmarks', { examId });
      bookmarkedIds.value.add(examId);
      bookmarkedIds.value = new Set(bookmarkedIds.value);
    }
  } catch {
  }
}
</script>

<template>
  <div>
    <h1>Available Exams</h1>

    <div v-if="categories.length > 0" style="margin-bottom:16px">
      <select v-model="selectedCategory" class="category-select">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="filteredExams.length === 0" class="card" style="text-align:center;color:#666">
      No exams found{{ selectedCategory ? ' in this category' : '' }}.
    </div>
    <div v-else>
      <div v-for="exam in filteredExams" :key="exam.id" class="card exam-card">
        <div class="exam-header">
          <h2>{{ exam.title }}</h2>
          <button
            v-if="showBookmarks"
            class="bookmark-btn"
            :class="{ bookmarked: bookmarkedIds.has(exam.id) }"
            @click.prevent="toggleBookmark(exam.id)"
            :title="bookmarkedIds.has(exam.id) ? 'Remove bookmark' : 'Bookmark'"
          >
            {{ bookmarkedIds.has(exam.id) ? '★' : '☆' }}
          </button>
        </div>
        <p class="exam-desc">{{ exam.description }}</p>
        <div class="exam-meta">
          <span>{{ exam.questionCount }} questions</span>
          <span>{{ exam.timeLimitMinutes }} minutes</span>
          <span v-if="exam.categoryName" class="category-tag">{{ exam.categoryName }}</span>
        </div>
        <router-link :to="`/exams/${exam.id}`" class="btn btn-primary">View Details</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

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
  align-items: center;
}

.category-tag {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.bookmark-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  line-height: 1;
  padding: 0;
}

.bookmark-btn.bookmarked {
  color: #f5a623;
}
</style>
