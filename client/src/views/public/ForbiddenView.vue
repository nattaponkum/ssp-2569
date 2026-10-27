<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <h1>403 ไม่มีสิทธิ์เข้าถึง</h1>
    <p class="muted">บัญชีของท่านไม่มีสิทธิ์เปิดหน้านี้</p>
    <RouterLink to="/">กลับหน้าแรก</RouterLink>
  </section>
</template>
