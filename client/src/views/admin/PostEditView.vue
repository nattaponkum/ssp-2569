<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Post, PostCreate } from '@ssp/shared'
import { postsApi } from '@/api/posts'
import PostForm from '@/components/PostForm.vue'
import { useUiStore } from '@/stores/ui'

// ใช้หน้าเดียวกันทั้งเขียนใหม่ (/admin/posts/new ไม่มี id) และแก้ไข (/admin/posts/:id/edit)
const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const ui = useUiStore()
const post = ref<Post | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  if (!props.id) return
  loading.value = true
  try {
    post.value = await postsApi.adminGet(Number(props.id))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'โหลดบทความไม่สำเร็จ'
  } finally {
    loading.value = false
  }
})

async function save(data: PostCreate) {
  saving.value = true
  error.value = ''
  try {
    if (post.value) await postsApi.update(post.value.id, data)
    else await postsApi.create(data)
    ui.notify('บันทึกบทความแล้ว')
    await router.push({ name: 'admin-posts' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section>
    <h1>{{ id ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">กำลังโหลด...</p>
    <PostForm v-else :post="post" :saving="saving" @submit="save" />
  </section>
</template>
