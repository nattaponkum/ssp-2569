<script setup lang="ts">
import { ref } from 'vue'
import { uploadsApi, type UploadedImage } from '@/api/uploads'

withDefaults(
  defineProps<{
    label?: string
  }>(),
  { label: 'เลือกรูป' },
)

const emit = defineEmits<{
  uploaded: [image: UploadedImage]
}>()

// ตรวจเบื้องต้นฝั่ง client เพื่อบอกผู้ใช้ได้เร็ว
// (server ตรวจซ้ำเสมอ ห้ามเชื่อการตรวจฝั่ง client อย่างเดียว)
const MAX_SIZE = 2 * 1024 * 1024
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

const uploading = ref(false)
const error = ref('')

async function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // ล้างค่า เพื่อให้เลือกไฟล์เดิมซ้ำได้
  if (!file) return

  error.value = ''
  if (file.size > MAX_SIZE) {
    error.value = 'ไฟล์ใหญ่เกิน 2 MB'
    return
  }

  uploading.value = true
  try {
    emit('uploaded', await uploadsApi.upload(file))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <span class="uploader">
    <label class="button">
      {{ uploading ? 'กำลังอัปโหลด...' : label }}
      <input type="file" :accept="ACCEPT" :disabled="uploading" hidden @change="onChange" />
    </label>
    <small v-if="error" class="error">{{ error }}</small>
  </span>
</template>

<style scoped>
.uploader {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.button {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-soft);
  cursor: pointer;
}
</style>
