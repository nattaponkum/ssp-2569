<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { z } from 'zod'
import { postCreateSchema, type Post, type PostCreate, type PostStatus } from '@ssp/shared'
import ImageUploader from './ImageUploader.vue'
import RichTextEditor from './RichTextEditor.vue'

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
  thumbnail: string | null
}

const form = reactive<FormState>({
  title: '',
  category: '',
  status: 'draft',
  content: '',
  thumbnail: null,
})
const errors = ref<Partial<Record<keyof FormState, string[]>>>({})

watch(
  () => props.post,
  (post) => {
    form.title = post?.title ?? ''
    form.category = post?.category ?? ''
    form.status = post?.status ?? 'draft'
    form.content = post?.content ?? ''
    form.thumbnail = post?.thumbnail ?? null
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
  // editor ที่ว่างอยู่ยังส่ง <p></p> มา ตรวจว่ามีข้อความจริงหรือไม่ (server ตรวจซ้ำอีกชั้น)
  const html = new DOMParser().parseFromString(result.data.content, 'text/html')
  if (!html.body.textContent?.trim()) {
    errors.value = { content: ['กรุณาใส่เนื้อหาบทความ'] }
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
    <div class="field">
      รูปปก
      <img v-if="form.thumbnail" :src="form.thumbnail" alt="รูปปก" class="thumbnail" />
      <div>
        <ImageUploader
          :label="form.thumbnail ? 'เปลี่ยนรูปปก' : 'อัปโหลดรูปปก'"
          @uploaded="form.thumbnail = $event.url"
        />
        <button v-if="form.thumbnail" type="button" @click="form.thumbnail = null">
          เอารูปปกออก
        </button>
      </div>
    </div>
    <div class="field">
      เนื้อหา
      <!-- v-model บน component: ส่ง modelValue เข้าไป และรับ update:modelValue กลับมา -->
      <RichTextEditor v-model="form.content" />
      <small v-if="errors.content" class="error">{{ errors.content[0] }}</small>
    </div>
    <div>
      <button type="submit" class="primary" :disabled="saving">บันทึก</button>
    </div>
  </form>
</template>

<style scoped>
.post-form {
  max-width: none;
}

.field {
  display: grid;
  gap: 0.25rem;
}

.thumbnail {
  max-width: 240px;
  border-radius: 6px;
}
</style>
