<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { User, UserCreate, UserUpdate } from '@ssp/shared'
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
// โหลดรายการไม่สำเร็จ: ซ่อนตาราง ไม่ให้แถว "ยังไม่มีผู้ใช้" แสดงพร้อมข้อความ error
const loadFailed = ref(false)
// เปลี่ยนค่า key เพื่อให้ Vue สร้างฟอร์มใหม่ (ล้างช่องกรอก) หลังบันทึกสำเร็จ
const formKey = ref(0)

async function load() {
  loading.value = true
  error.value = ''
  loadFailed.value = false
  try {
    users.value = await usersApi.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ'
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

// เรียกเว็บเซอร์วิสเพื่อบันทึก แล้วโหลดรายการใหม่ (ใช้ร่วมกันทั้งสร้างและแก้ไข)
async function save(request: () => Promise<User>, message: string) {
  saving.value = true
  error.value = ''
  try {
    await request()
    ui.notify(message)
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

function create(data: UserCreate) {
  return save(() => usersApi.create(data), 'เพิ่มผู้ใช้แล้ว')
}

function update(data: UserUpdate) {
  const id = editing.value!.id
  return save(() => usersApi.update(id, data), 'แก้ไขผู้ใช้แล้ว')
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
    <UserTable
      v-else-if="!loadFailed"
      :users="users"
      @edit="editing = $event"
      @delete="remove"
    />

    <h2>{{ editing ? `แก้ไข ${editing.name}` : 'เพิ่มผู้ใช้ใหม่' }}</h2>
    <UserForm
      :key="formKey"
      :user="editing"
      :saving="saving"
      @create="create"
      @update="update"
      @cancel="editing = null"
    />
  </section>
</template>
