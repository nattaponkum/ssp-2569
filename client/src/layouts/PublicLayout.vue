<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <!-- โครงหน้าของผู้อ่านทั่วไป: แถบเมนูด้านบน + เนื้อหา -->
  <NavBar />
  <main class="container">
    <RouterView />
  </main>
</template>
