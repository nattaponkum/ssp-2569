<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { z } from 'zod'
import {
  userCreateSchema,
  userUpdateSchema,
  type Role,
  type User,
  type UserCreate,
  type UserUpdate,
} from '@ssp/shared'

const props = defineProps<{
  // ผู้ใช้ที่กำลังแก้ไข (null = สร้างใหม่)
  user: User | null
  // กำลังส่งข้อมูลไป server อยู่หรือไม่ (ปิดปุ่มกันกดซ้ำ)
  saving?: boolean
}>()

// แยก event ของการสร้างและการแก้ไข เพราะข้อมูลที่ต้องส่งต่างกัน
const emit = defineEmits<{
  create: [data: UserCreate]
  update: [data: UserUpdate]
  cancel: []
}>()

interface FormState {
  email: string
  name: string
  lastname: string
  password: string
  role: Role
}

// reactive: object ที่ Vue ติดตามการเปลี่ยนแปลง ผูกกับ input ด้วย v-model
const form = reactive<FormState>({ email: '', name: '', lastname: '', password: '', role: 'user' })
// ข้อความ error รายฟิลด์ เช่น { email: ['...'] }
const errors = ref<Partial<Record<keyof FormState, string[]>>>({})

// เมื่อ parent เปลี่ยนผู้ใช้ที่จะแก้ไข ให้เติมค่าลงฟอร์มใหม่
watch(
  () => props.user,
  (user) => {
    form.email = user?.email ?? ''
    form.name = user?.name ?? ''
    form.lastname = user?.lastname ?? ''
    form.password = ''
    form.role = user?.role ?? 'user'
    errors.value = {}
  },
  { immediate: true },
)

function onSubmit() {
  // ตอนแก้ไข ช่องรหัสผ่านว่าง = ไม่เปลี่ยนรหัสผ่าน จึงไม่ส่งฟิลด์ password ไปเลย
  const { password, ...profile } = form
  const input = password ? form : profile

  // ตรวจด้วย schema เดียวกับที่ server ใช้ ผู้ใช้จึงเห็น error ทันทีโดยไม่ต้องรอ server
  if (props.user) {
    const result = userUpdateSchema.safeParse(input)
    if (result.success) emit('update', result.data)
    errors.value = result.success ? {} : z.flattenError(result.error).fieldErrors
  } else {
    const result = userCreateSchema.safeParse(input)
    if (result.success) emit('create', result.data)
    errors.value = result.success ? {} : z.flattenError(result.error).fieldErrors
  }
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <label>
      อีเมล
      <input v-model="form.email" type="email" />
      <small v-if="errors.email" class="error">{{ errors.email[0] }}</small>
    </label>
    <label>
      ชื่อ
      <input v-model="form.name" />
      <small v-if="errors.name" class="error">{{ errors.name[0] }}</small>
    </label>
    <label>
      นามสกุล
      <input v-model="form.lastname" />
      <small v-if="errors.lastname" class="error">{{ errors.lastname[0] }}</small>
    </label>
    <label>
      รหัสผ่าน {{ user ? '(เว้นว่างถ้าไม่เปลี่ยน)' : '' }}
      <input v-model="form.password" type="password" autocomplete="new-password" />
      <small v-if="errors.password" class="error">{{ errors.password[0] }}</small>
    </label>
    <label>
      บทบาท
      <select v-model="form.role">
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </label>
    <div>
      <button type="submit" class="primary" :disabled="saving">
        {{ user ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้' }}
      </button>
      <button v-if="user" type="button" @click="emit('cancel')">ยกเลิก</button>
    </div>
  </form>
</template>
