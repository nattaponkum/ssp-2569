<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <!-- โครงหน้า (layout) ถูกเลือกโดย router: PublicLayout หรือ AdminLayout -->
  <RouterView />
  <p v-if="ui.notice" class="notice">{{ ui.notice }}</p>
</template>

<style scoped>
.notice {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  margin: 0;
  background: #dafbe1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}
</style>
