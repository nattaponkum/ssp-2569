<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { PostSummary } from '@ssp/shared'
import { formatDate } from '@/utils/date'

defineProps<{
  post: PostSummary
}>()
</script>

<template>
  <article class="post-card">
    <h2>
      <RouterLink :to="{ name: 'post', params: { id: post.id } }">{{ post.title }}</RouterLink>
    </h2>
    <p class="muted">
      {{ post.category }} · {{ post.authorName }} · {{ formatDate(post.createdAt) }}
    </p>
    <p>{{ post.excerpt }}</p>
  </article>
</template>

<style scoped>
.post-card {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.post-card h2 {
  margin: 0;
  font-size: 1.25rem;
}

.post-card p {
  margin: 0.25rem 0;
}
</style>
