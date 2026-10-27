<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { postsApi } from '@/api/posts'

const route = useRoute()
const categories = ref<string[]>([])

onMounted(async () => {
  try {
    categories.value = await postsApi.categories()
  } catch {
    categories.value = [] // เมนูหมวดหมู่ไม่ใช่ส่วนสำคัญ โหลดไม่ได้ก็ซ่อนไว้
  }
})
</script>

<template>
  <!-- ลิงก์เปลี่ยนเฉพาะ ?category= ใน URL และคงคำค้นหาเดิมไว้ -->
  <nav class="categories">
    <RouterLink
      :to="{ query: { ...route.query, category: undefined } }"
      :class="{ active: !route.query.category }"
    >
      ทั้งหมด
    </RouterLink>
    <RouterLink
      v-for="category in categories"
      :key="category"
      :to="{ query: { ...route.query, category } }"
      :class="{ active: route.query.category === category }"
    >
      {{ category }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
}

.categories a {
  padding: 0.15rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  text-decoration: none;
}

.categories a.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
</style>
