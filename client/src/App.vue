<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()

// ถาม server ครั้งแรกที่เปิดเว็บ ว่ามี cookie ที่ login ค้างไว้อยู่หรือไม่
onMounted(auth.fetchMe)

async function logout() {
  await auth.logout()
  await router.push('/login')
}
</script>

<template>
  <header class="container">
    <nav>
      <RouterLink to="/">หน้าแรก</RouterLink>
      <RouterLink to="/admin/users">ผู้ใช้</RouterLink>
      <span class="spacer"></span>
      <template v-if="auth.user">
        <span>{{ auth.user.name }} ({{ auth.user.role }})</span>
        <button type="button" @click="logout">ออกจากระบบ</button>
      </template>
      <RouterLink v-else to="/login">เข้าสู่ระบบ</RouterLink>
    </nav>
  </header>

  <main class="container">
    <p v-if="ui.notice" class="notice">{{ ui.notice }}</p>
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.spacer {
  flex: 1;
}

nav a.router-link-exact-active {
  font-weight: bold;
}

.notice {
  background: #dafbe1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
</style>
