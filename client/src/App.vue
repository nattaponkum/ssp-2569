<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <header class="container">
    <nav>
      <RouterLink to="/">หน้าแรก</RouterLink>
      <RouterLink to="/admin/users">ผู้ใช้</RouterLink>
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
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
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
