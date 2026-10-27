<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { z } from 'zod'
import { postCreateSchema, type Post, type PostCreate, type PostStatus } from '@ssp/shared'

const props = defineProps<{
  // บทความที่กำลังแก้ไข (null = เขียนใหม่)
  post: Post | null
  saving?: boolean
}>()

const emit = defineEmits<{
  submit: [data: PostCreate]
}>()

interface FormState {
  title: string
  category: string
  status: PostStatus
  content: string
}

const form = reactive<FormState>({ title: '', category: '', status: 'draft', content: '' })
const errors = ref<Partial<Record<keyof FormState, string[]>>>({})

watch(
  () => props.post,
  (post) => {
    form.title = post?.title ?? ''
    form.category = post?.category ?? ''
    form.status = post?.status ?? 'draft'
    form.content = post?.content ?? ''
  },
  { immediate: true },
)

function onSubmit() {
  // ส่งครบทุกฟิลด์ทั้งตอนสร้างและแก้ไข จึงตรวจด้วย postCreateSchema ได้ทั้งสองกรณี
  const result = postCreateSchema.safeParse(form)
  if (!result.success) {
    errors.value = z.flattenError(result.error).fieldErrors
    return
  }
  errors.value = {}
  emit('submit', result.data)
}
</script>

<template>
  <form class="post-form" novalidate @submit.prevent="onSubmit">
    <label>
      ชื่อเรื่อง
      <input v-model="form.title" />
      <small v-if="errors.title" class="error">{{ errors.title[0] }}</small>
    </label>
    <label>
      หมวดหมู่
      <input v-model="form.category" placeholder="เช่น บทเรียน" />
      <small v-if="errors.category" class="error">{{ errors.category[0] }}</small>
    </label>
    <label>
      สถานะ
      <select v-model="form.status">
        <option value="draft">ฉบับร่าง</option>
        <option value="published">เผยแพร่</option>
      </select>
    </label>
    <label>
      เนื้อหา
      <textarea v-model="form.content" rows="12"></textarea>
      <small v-if="errors.content" class="error">{{ errors.content[0] }}</small>
    </label>
    <div>
      <button type="submit" class="primary" :disabled="saving">บันทึก</button>
    </div>
  </form>
</template>

<style scoped>
.post-form {
  max-width: none;
}
</style>
