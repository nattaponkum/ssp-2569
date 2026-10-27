<script setup lang="ts">
import type { User } from '@ssp/shared'

// props: ข้อมูลที่ parent ส่งเข้ามา (component นี้ไม่แก้ไข props เอง)
defineProps<{
  users: User[]
}>()

// emits: เหตุการณ์ที่ส่งกลับไปให้ parent ตัดสินใจว่าจะทำอะไร
const emit = defineEmits<{
  edit: [user: User]
  delete: [id: number]
}>()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>id</th>
        <th>อีเมล</th>
        <th>ชื่อ</th>
        <th>นามสกุล</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.id }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.name }}</td>
        <td>{{ user.lastname }}</td>
        <td>
          <button type="button" @click="emit('edit', user)">แก้ไข</button>
          <button type="button" class="danger" @click="emit('delete', user.id)">ลบ</button>
        </td>
      </tr>
      <tr v-if="users.length === 0">
        <td colspan="5" class="muted">ยังไม่มีผู้ใช้</td>
      </tr>
    </tbody>
  </table>
</template>
