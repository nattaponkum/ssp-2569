<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <!-- โครงหน้าของ Back Office: แถบเมนูด้านบน + เมนูด้านข้าง + เนื้อหา -->
  <NavBar />
  <div class="admin container">
    <aside>
      <strong>จัดการระบบ</strong>
      <RouterLink v-if="auth.isAdmin" :to="{ name: 'admin-users' }">ผู้ใช้</RouterLink>
    </aside>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1.5rem;
}

aside {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
}

aside a.router-link-active {
  font-weight: bold;
}

/* จอเล็กให้เมนูด้านข้างไปอยู่ด้านบน */
@media (max-width: 640px) {
  .admin {
    grid-template-columns: 1fr;
  }
}
</style>
