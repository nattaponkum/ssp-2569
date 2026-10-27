<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { PostSummary } from '@ssp/shared'
import { postsApi } from '@/api/posts'
import { useUiStore } from '@/stores/ui'
import { formatDate } from '@/utils/date'

const ui = useUiStore()
const posts = ref<PostSummary[]>([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    posts.value = await postsApi.adminList()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'โหลดบทความไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function remove(post: PostSummary) {
  if (!confirm(`ยืนยันการลบบทความ "${post.title}"?`)) return
  try {
    await postsApi.remove(post.id)
    ui.notify('ลบบทความแล้ว')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ลบไม่สำเร็จ'
  }
}

onMounted(load)
</script>

<template>
  <section>
    <h1>บทความ</h1>
    <p><RouterLink :to="{ name: 'admin-post-new' }">+ เขียนบทความใหม่</RouterLink></p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">กำลังโหลด...</p>
    <table v-else>
      <thead>
        <tr>
          <th>ชื่อเรื่อง</th>
          <th>หมวดหมู่</th>
          <th>ผู้เขียน</th>
          <th>สถานะ</th>
          <th>แก้ไขล่าสุด</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td>{{ post.title }}</td>
          <td>{{ post.category }}</td>
          <td>{{ post.authorName }}</td>
          <td>{{ post.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง' }}</td>
          <td>{{ formatDate(post.updatedAt) }}</td>
          <td>
            <RouterLink :to="{ name: 'admin-post-edit', params: { id: post.id } }">แก้ไข</RouterLink>
            <button type="button" class="danger" @click="remove(post)">ลบ</button>
          </td>
        </tr>
        <tr v-if="posts.length === 0">
          <td colspan="6" class="muted">ยังไม่มีบทความ</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
