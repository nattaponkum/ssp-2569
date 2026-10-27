<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { Post } from '@ssp/shared'
import { postsApi } from '@/api/posts'
import { formatDate } from '@/utils/date'

// router ส่ง :id มาเป็น prop (ตั้ง props: true ไว้ใน router)
const props = defineProps<{
  id: string
}>()

const post = ref<Post | null>(null)
const error = ref('')

// โหลดใหม่ทุกครั้งที่ id เปลี่ยน (เช่น กดลิงก์ไปบทความอื่นโดยไม่ออกจากหน้านี้)
watch(
  () => props.id,
  async (id) => {
    post.value = null
    error.value = ''
    try {
      post.value = await postsApi.get(Number(id))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'โหลดบทความไม่สำเร็จ'
    }
  },
  { immediate: true },
)
</script>

<template>
  <article v-if="post">
    <h1>{{ post.title }}</h1>
    <p class="muted">
      {{ post.category }} · {{ post.authorName }} · {{ formatDate(post.createdAt) }}
    </p>
    <img v-if="post.thumbnail" :src="post.thumbnail" alt="" class="thumbnail" />
    <!-- v-html แสดง HTML ตามจริง ใช้ได้เพราะ server sanitize เนื้อหาแล้วเท่านั้น
         ห้ามใช้ v-html กับข้อมูลจากผู้ใช้ที่ยังไม่ผ่านการ sanitize (เสี่ยง XSS) -->
    <div class="content" v-html="post.content"></div>
  </article>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else class="muted">กำลังโหลด...</p>
  <p><RouterLink to="/">กลับหน้าแรก</RouterLink></p>
</template>

<style scoped>
.thumbnail {
  width: 100%;
  border-radius: 6px;
}

.content :deep(img) {
  max-width: 100%;
}
</style>
