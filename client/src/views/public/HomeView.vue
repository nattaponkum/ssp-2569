<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PostSummary } from '@ssp/shared'
import { postsApi } from '@/api/posts'
import PostCard from '@/components/PostCard.vue'

const posts = ref<PostSummary[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    posts.value = await postsApi.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'โหลดบทความไม่สำเร็จ'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <h1>บทความล่าสุด</h1>
    <p v-if="loading" class="muted">กำลังโหลด...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="posts.length === 0" class="muted">ยังไม่มีบทความ</p>
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
  </section>
</template>
