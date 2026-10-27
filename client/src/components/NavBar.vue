<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  ui.notify('ออกจากระบบแล้ว')
  await router.push({ name: 'home' })
}
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="brand">SSP Blog</RouterLink>
    <span class="spacer"></span>
    <!-- เมนูเปลี่ยนตามสถานะการเข้าสู่ระบบ -->
    <template v-if="auth.user">
      <RouterLink to="/admin">จัดการ</RouterLink>
      <span class="muted">{{ auth.user.name }} ({{ auth.user.role }})</span>
      <button type="button" @click="logout">ออกจากระบบ</button>
    </template>
    <RouterLink v-else to="/login">เข้าสู่ระบบ</RouterLink>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.brand {
  font-weight: bold;
  text-decoration: none;
}

.spacer {
  flex: 1;
}
</style>
