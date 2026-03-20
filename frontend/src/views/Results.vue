<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api/client';

const route = useRoute();

interface BreakdownItem {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
}

interface ResultData {
  attemptId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  breakdown: BreakdownItem[];
  submittedAt: string;
}

const result = ref<ResultData | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const attemptId = route.params.id;
    const { data } = await api.get(`/attempts/${attemptId}/result`);
    result.value = data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load results';
  } finally {
    loading.value = false;
  }
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function optionLetter(idx: number): string {
  return String.fromCharCode(65 + idx);
}
</script>

<template>
  <div>
    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading results...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="result">
      <div class="card result-card">
        <h1>{{ result.examTitle }} - Results</h1>

        <div class="score-display">
          <div class="score-circle" :class="result.percentage >= 70 ? 'score-pass' : 'score-fail'">
            {{ result.percentage }}%
          </div>
          <div class="score-detail">
            <div class="score-fraction">{{ result.score }} / {{ result.totalQuestions }}</div>
            <div class="score-label">correct answers</div>
          </div>
        </div>

        <p v-if="result.percentage >= 70" class="success-msg" style="text-align:center">
          Congratulations! You passed the exam.
        </p>
        <p v-else class="error-msg" style="text-align:center">
          You did not pass. 70% is required. Keep practicing!
        </p>

        <div v-if="result.submittedAt" style="text-align:center;color:#888;font-size:13px;margin-top:12px">
          Submitted on {{ formatDate(result.submittedAt) }}
        </div>
      </div>

      <h2>Question Breakdown</h2>
      <div v-for="(item, idx) in result.breakdown" :key="item.questionId" class="card breakdown-card">
        <div class="breakdown-header">
          <span class="question-num">Question {{ idx + 1 }}</span>
          <span :class="item.isCorrect ? 'badge-correct' : 'badge-wrong'">
            {{ item.isCorrect ? 'Correct' : 'Incorrect' }}
          </span>
        </div>
        <p class="question-text">{{ item.questionText }}</p>
        <div class="options-review">
          <div
            v-for="(option, optIdx) in item.options"
            :key="optIdx"
            class="option-review"
            :class="{
              'option-correct': optIdx === item.correctOption,
              'option-wrong': optIdx === item.selectedOption && !item.isCorrect,
            }"
          >
            <span class="opt-letter">{{ optionLetter(optIdx) }}</span>
            <span>{{ option }}</span>
            <span v-if="optIdx === item.correctOption" class="opt-tag correct-tag">Correct</span>
            <span v-if="optIdx === item.selectedOption && optIdx !== item.correctOption" class="opt-tag wrong-tag">Your Answer</span>
            <span v-if="optIdx === item.selectedOption && optIdx === item.correctOption" class="opt-tag correct-tag">Your Answer</span>
          </div>
        </div>
      </div>

      <div class="card" style="text-align:center;display:flex;gap:12px;justify-content:center">
        <router-link to="/dashboard" class="btn btn-primary">Back to Dashboard</router-link>
        <router-link to="/exams" class="btn" style="background:#eee;color:#333">Try Another Exam</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  text-align: center;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin: 32px 0;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
}

.score-pass {
  background: #e6f4ea;
  color: #137333;
  border: 3px solid #137333;
}

.score-fail {
  background: #fce8e6;
  color: #c5221f;
  border: 3px solid #c5221f;
}

.score-fraction {
  font-size: 28px;
  font-weight: 600;
}

.score-label {
  font-size: 14px;
  color: #888;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-num {
  font-size: 12px;
  text-transform: uppercase;
  color: #888;
  font-weight: 600;
}

.badge-correct {
  background: #e6f4ea;
  color: #137333;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-wrong {
  background: #fce8e6;
  color: #c5221f;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.question-text {
  font-size: 15px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.options-review {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-review {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  font-size: 14px;
}

.option-correct {
  border-color: #137333;
  background: #e6f4ea;
}

.option-wrong {
  border-color: #c5221f;
  background: #fce8e6;
}

.opt-letter {
  background: #eee;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.opt-tag {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.correct-tag {
  background: #137333;
  color: white;
}

.wrong-tag {
  background: #c5221f;
  color: white;
}
</style>
