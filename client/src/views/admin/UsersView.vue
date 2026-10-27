<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { User, UserCreate } from '@ssp/shared'
import { usersApi } from '@/api/users'
import UserForm from '@/components/UserForm.vue'
import UserTable from '@/components/UserTable.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

const users = ref<User[]>([])
const editing = ref<User | null>(null)
// สถานะของหน้าจอ: กำลังโหลด กำลังบันทึก และข้อความ error
const loading = ref(false)
const saving = ref(false)
const error = ref('')
// เปลี่ยนค่า key เพื่อให้ Vue สร้างฟอร์มใหม่ (ล้างช่องกรอก) หลังบันทึกสำเร็จ
const formKey = ref(0)

async function load() {
  loading.value = true
  error.value = ''
  try {
    users.value = await usersApi.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function save(data: UserCreate) {
  saving.value = true
  error.value = ''
  try {
    if (editing.value) {
      await usersApi.update(editing.value.id, data)
      ui.notify('แก้ไขผู้ใช้แล้ว')
    } else {
      await usersApi.create(data)
      ui.notify('เพิ่มผู้ใช้แล้ว')
    }
    editing.value = null
    formKey.value++
    await load()
  } catch (e) {
    // เช่น 409 อีเมลซ้ำ: แสดงข้อความที่ server ส่งมา
    error.value = e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('ยืนยันการลบผู้ใช้นี้?')) return
  try {
    await usersApi.remove(id)
    ui.notify('ลบผู้ใช้แล้ว')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ลบไม่สำเร็จ'
  }
}

// โหลดข้อมูลเมื่อ component ถูกแสดงบนหน้าจอ
onMounted(load)
</script>

<template>
  <section>
    <h1>จัดการผู้ใช้</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">กำลังโหลด...</p>
    <UserTable v-else :users="users" @edit="editing = $event" @delete="remove" />

    <h2>{{ editing ? `แก้ไข ${editing.name}` : 'เพิ่มผู้ใช้ใหม่' }}</h2>
    <UserForm
      :key="formKey"
      :user="editing"
      :saving="saving"
      @submit="save"
      @cancel="editing = null"
    />
  </section>
</template>
