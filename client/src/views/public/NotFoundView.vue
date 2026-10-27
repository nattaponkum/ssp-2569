<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <h1>404 ไม่พบหน้านี้</h1>
    <p class="muted">ลิงก์อาจผิด หรือหน้านี้ถูกลบไปแล้ว</p>
    <RouterLink to="/">กลับหน้าแรก</RouterLink>
  </section>
</template>
