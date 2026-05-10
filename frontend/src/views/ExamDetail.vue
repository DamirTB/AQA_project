<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/client';
import { showReviews } from '../config/uiFeatures';

const route = useRoute();
const router = useRouter();

interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questionCount: number;
  categoryName: string | null;
}

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const exam = ref<Exam | null>(null);
const reviews = ref<Review[]>([]);
const loading = ref(true);
const starting = ref(false);
const error = ref('');

const hasCompleted = ref(false);
const hasReviewed = ref(false);
const reviewRating = ref(5);
const reviewComment = ref('');
const reviewSubmitting = ref(false);
const reviewError = ref('');
const reviewSuccess = ref('');

onMounted(async () => {
  try {
    const examId = route.params.id;
    const examRes = await api.get(`/exams/${examId}`);
    exam.value = examRes.data;

    const historyRes = await api.get('/attempts/history');
    hasCompleted.value = historyRes.data.some(
      (a: { examId: string; status: string }) => a.examId === examId && a.status === 'completed',
    );

    if (showReviews) {
      const reviewsRes = await api.get(`/exams/${examId}/reviews`);
      reviews.value = reviewsRes.data;
      const currentUsername = JSON.parse(localStorage.getItem('user') || '{}').username;
      hasReviewed.value = reviewsRes.data.some((r: { username: string }) => r.username === currentUsername);
    }
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

async function submitReview() {
  if (!showReviews) return;
  reviewError.value = '';
  reviewSuccess.value = '';

  if (!reviewComment.value.trim()) {
    reviewError.value = 'Please write a comment';
    return;
  }

  reviewSubmitting.value = true;
  try {
    await api.post(`/exams/${route.params.id}/reviews`, {
      rating: reviewRating.value,
      comment: reviewComment.value.trim(),
    });
    reviewSuccess.value = 'Review submitted!';
    hasReviewed.value = true;
    reviewComment.value = '';

    const { data } = await api.get(`/exams/${route.params.id}/reviews`);
    reviews.value = data;
  } catch (err: any) {
    const data = err.response?.data;
    reviewError.value = data?.error || 'Failed to submit review';
  } finally {
    reviewSubmitting.value = false;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
</script>

<template>
  <div>
    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="exam">
      <div class="card">
        <h1>{{ exam.title }}</h1>
        <span v-if="exam.categoryName" class="category-tag">{{ exam.categoryName }}</span>
        <p style="color:#666;margin:12px 0 20px">{{ exam.description }}</p>
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

      <template v-if="showReviews">
      <h2>Reviews ({{ reviews.length }})</h2>

      <div v-if="hasCompleted && !hasReviewed" class="card">
        <h3 style="margin-bottom:12px">Write a Review</h3>
        <div v-if="reviewError" class="error-msg">{{ reviewError }}</div>
        <div v-if="reviewSuccess" class="success-msg">{{ reviewSuccess }}</div>
        <div class="form-group">
          <label>Rating</label>
          <div class="rating-select">
            <button
              v-for="n in 5"
              :key="n"
              class="star-btn"
              :class="{ active: n <= reviewRating }"
              @click="reviewRating = n"
            >★</button>
          </div>
        </div>
        <div class="form-group">
          <label for="review-comment">Comment</label>
          <textarea
            id="review-comment"
            v-model="reviewComment"
            placeholder="Share your experience..."
            class="textarea"
            rows="3"
          ></textarea>
        </div>
        <button class="btn btn-primary" :disabled="reviewSubmitting" @click="submitReview">
          {{ reviewSubmitting ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>

      <div v-if="reviews.length === 0" class="card" style="text-align:center;color:#666">
        No reviews yet.
      </div>
      <div v-for="review in reviews" :key="review.id" class="card review-card">
        <div class="review-header">
          <span class="review-stars">{{ stars(review.rating) }}</span>
          <span class="review-meta">{{ review.username }} &middot; {{ formatDate(review.createdAt) }}</span>
        </div>
        <p class="review-comment">{{ review.comment }}</p>
      </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.category-tag {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  display: inline-block;
}

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

.rating-select {
  display: flex;
  gap: 4px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ddd;
  padding: 0;
}

.star-btn.active {
  color: #f5a623;
}

.review-card {
  padding: 16px 24px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-stars {
  color: #f5a623;
  font-size: 16px;
}

.review-meta {
  font-size: 12px;
  color: #aaa;
}

.review-comment {
  font-size: 14px;
  line-height: 1.5;
}
</style>
