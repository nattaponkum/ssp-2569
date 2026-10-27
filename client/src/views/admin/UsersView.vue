<script setup lang="ts">
import { ref } from 'vue'
import UserForm from '@/components/UserForm.vue'
import UserTable from '@/components/UserTable.vue'
import { useUiStore } from '@/stores/ui'
import type { User, UserInput } from '@/types'

const ui = useUiStore()

// ข้อมูลคงที่ในหน้านี้ (บทที่ 9 จะโหลดจากเว็บเซอร์วิสแทน)
const users = ref<User[]>([
  { id: 1, email: 'somchai@example.com', name: 'สมชาย', lastname: 'ใจดี' },
  { id: 2, email: 'somsri@example.com', name: 'สมศรี', lastname: 'รักเรียน' },
])
const editing = ref<User | null>(null)
let nextId = 3

function save(data: UserInput) {
  if (editing.value) {
    Object.assign(editing.value, data)
    ui.notify('แก้ไขผู้ใช้แล้ว')
  } else {
    users.value.push({ id: nextId++, ...data })
    ui.notify('เพิ่มผู้ใช้แล้ว')
  }
  editing.value = null
}

function remove(id: number) {
  users.value = users.value.filter((u) => u.id !== id)
  ui.notify('ลบผู้ใช้แล้ว')
}
</script>

<template>
  <section>
    <h1>จัดการผู้ใช้</h1>
    <UserTable :users="users" @edit="editing = $event" @delete="remove" />
    <h2>{{ editing ? `แก้ไข ${editing.name}` : 'เพิ่มผู้ใช้ใหม่' }}</h2>
    <UserForm :user="editing" @submit="save" @cancel="editing = null" />
  </section>
</template>
