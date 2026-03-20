<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/client';

const route = useRoute();
const router = useRouter();

interface Question {
  id: string;
  text: string;
  options: string[];
  order: number;
}

interface AttemptData {
  attemptId: string;
  exam: { id: string; title: string; timeLimitMinutes: number };
  questions: Question[];
  startedAt: string;
  answers: Record<string, number>;
}

const attemptData = ref<AttemptData | null>(null);
const answers = ref<Record<string, number>>({});
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const remainingSeconds = ref(0);

let timerInterval: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60);
  const secs = remainingSeconds.value % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

const answeredCount = computed(() => Object.keys(answers.value).length);

onMounted(async () => {
  try {
    const attemptId = route.params.id;

    let data: AttemptData;
    try {
      const resp = await api.get(`/attempts/history`);
      const existing = resp.data.find(
        (a: any) => a.attemptId === attemptId && a.status === 'in_progress'
      );
      if (existing) {
        const startResp = await api.post('/attempts/start', { examId: existing.examId });
        data = startResp.data;
      } else {
        const completed = resp.data.find(
          (a: any) => a.attemptId === attemptId && a.status === 'completed'
        );
        if (completed) {
          router.replace(`/results/${attemptId}`);
          return;
        }
        throw new Error('Attempt not found');
      }
    } catch {
      error.value = 'Failed to load attempt. It may have already been submitted.';
      loading.value = false;
      return;
    }

    attemptData.value = data;
    answers.value = data.answers || {};

    const startTime = new Date(data.startedAt).getTime();
    const limitMs = data.exam.timeLimitMinutes * 60 * 1000;
    const endTime = startTime + limitMs;

    function updateTimer() {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      remainingSeconds.value = remaining;
      if (remaining <= 0) {
        submitExam();
      }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load exam attempt';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function selectAnswer(questionId: string, optionIndex: number) {
  answers.value = { ...answers.value, [questionId]: optionIndex };
}

async function submitExam() {
  if (!attemptData.value || submitting.value) return;
  submitting.value = true;
  if (timerInterval) clearInterval(timerInterval);
  try {
    const { data } = await api.post('/attempts/submit', {
      attemptId: attemptData.value.attemptId,
      answers: answers.value,
    });
    router.push(`/results/${data.attemptId}`);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to submit exam';
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading exam...</div>
    <div v-else-if="error && !attemptData" class="error-msg">{{ error }}</div>
    <div v-else-if="attemptData">
      <div class="exam-header card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h1 style="margin-bottom:0">{{ attemptData.exam.title }}</h1>
          <div class="timer" :class="{ 'timer-warning': remainingSeconds < 60 }">
            {{ formattedTime }}
          </div>
        </div>
        <div style="margin-top:8px;font-size:13px;color:#666">
          {{ answeredCount }}/{{ attemptData.questions.length }} answered
        </div>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <div v-for="(question, idx) in attemptData.questions" :key="question.id" class="card question-card">
        <div class="question-num">Question {{ idx + 1 }}</div>
        <p class="question-text">{{ question.text }}</p>
        <div class="options">
          <label
            v-for="(option, optIdx) in question.options"
            :key="optIdx"
            class="option"
            :class="{ selected: answers[question.id] === optIdx }"
          >
            <input
              type="radio"
              :name="`q-${question.id}`"
              :value="optIdx"
              :checked="answers[question.id] === optIdx"
              @change="selectAnswer(question.id, optIdx)"
            />
            <span class="option-label">{{ String.fromCharCode(65 + optIdx) }}</span>
            <span>{{ option }}</span>
          </label>
        </div>
      </div>

      <div class="card" style="text-align:center">
        <button @click="submitExam" class="btn btn-primary" :disabled="submitting" style="padding:12px 40px;font-size:16px">
          {{ submitting ? 'Submitting...' : 'Submit Exam' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exam-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.timer {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.timer-warning {
  background: #fce8e6;
  color: #c5221f;
}

.question-num {
  font-size: 12px;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 8px;
  font-weight: 600;
}

.question-text {
  font-size: 16px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.option:hover {
  background: #f8f9fa;
}

.option.selected {
  border-color: #1a73e8;
  background: #e8f0fe;
}

.option input[type='radio'] {
  display: none;
}

.option-label {
  background: #eee;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.option.selected .option-label {
  background: #1a73e8;
  color: white;
}
</style>
