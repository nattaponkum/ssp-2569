<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { User, UserInput } from '@/types'

const props = defineProps<{
  // ผู้ใช้ที่กำลังแก้ไข (null = สร้างใหม่)
  user: User | null
}>()

const emit = defineEmits<{
  submit: [data: UserInput]
  cancel: []
}>()

// reactive: object ที่ Vue ติดตามการเปลี่ยนแปลง ผูกกับ input ด้วย v-model
const form = reactive<UserInput>({ email: '', name: '', lastname: '' })

// เมื่อ parent เปลี่ยนผู้ใช้ที่จะแก้ไข ให้เติมค่าลงฟอร์มใหม่
watch(
  () => props.user,
  (user) => {
    form.email = user?.email ?? ''
    form.name = user?.name ?? ''
    form.lastname = user?.lastname ?? ''
  },
  { immediate: true },
)

function onSubmit() {
  // ส่งสำเนาออกไป ไม่ส่ง object ของฟอร์มเอง
  emit('submit', { ...form })
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <label>
      อีเมล
      <input v-model="form.email" type="email" required />
    </label>
    <label>
      ชื่อ
      <input v-model="form.name" required />
    </label>
    <label>
      นามสกุล
      <input v-model="form.lastname" required />
    </label>
    <div>
      <button type="submit" class="primary">{{ user ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้' }}</button>
      <button v-if="user" type="button" @click="emit('cancel')">ยกเลิก</button>
    </div>
  </form>
</template>
