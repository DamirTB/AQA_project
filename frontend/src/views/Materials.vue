<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import api from '../api/client';

interface Material {
  id: string;
  title: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  createdAt: string;
}

const materials = ref<Material[]>([]);
const selectedTopic = ref('');
const loading = ref(true);
const error = ref('');

const topics = computed(() => {
  const unique = new Set(materials.value.map((m) => m.topic).filter(Boolean));
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
});

const filteredMaterials = computed(() => {
  if (!selectedTopic.value) return materials.value;
  return materials.value.filter((m) => m.topic === selectedTopic.value);
});

onMounted(async () => {
  try {
    const res = await api.get('/materials');
    materials.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load learning materials';
  } finally {
    loading.value = false;
  }
});

function levelLabel(level: Material['level']): string {
  if (level === 'beginner') return 'Beginner';
  if (level === 'intermediate') return 'Intermediate';
  return 'Advanced';
}
</script>

<template>
  <div>
    <h1>Learning Materials</h1>

    <div v-if="topics.length > 0" style="margin-bottom:16px">
      <select v-model="selectedTopic" class="topic-select">
        <option value="">All Topics</option>
        <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
      </select>
    </div>

    <div v-if="loading" style="padding:20px;text-align:center;color:#666">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="filteredMaterials.length === 0" class="card" style="text-align:center;color:#666">
      No learning materials found{{ selectedTopic ? ' for this topic' : '' }}.
    </div>
    <div v-else>
      <article v-for="material in filteredMaterials" :key="material.id" class="card material-card">
        <div class="material-header">
          <h2>{{ material.title }}</h2>
          <span class="level-tag">{{ levelLabel(material.level) }}</span>
        </div>
        <div class="material-meta">
          <span class="topic-tag">{{ material.topic }}</span>
        </div>
        <p class="material-content">{{ material.content }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.topic-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.material-card {
  margin-bottom: 14px;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.material-header h2 {
  margin-bottom: 6px;
}

.material-meta {
  margin-bottom: 12px;
}

.topic-tag {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.level-tag {
  background: #e6f4ea;
  color: #137333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.material-content {
  color: #444;
  line-height: 1.55;
  white-space: pre-wrap;
}
</style>
