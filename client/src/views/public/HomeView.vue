<script setup lang="ts">
import { computed, ref } from 'vue'

// ตัวอย่าง reactivity: ref เก็บค่า computed คำนวณใหม่อัตโนมัติเมื่อค่าที่ใช้เปลี่ยน
const name = ref('')
const greeting = computed(() => (name.value ? `สวัสดีคุณ${name.value}` : 'สวัสดีครับ'))
</script>

<template>
  <section>
    <h1>{{ greeting }}</h1>
    <p class="muted">หน้าแรกของเว็บบล็อก (บทที่ 12 จะแสดงรายการบทความที่นี่)</p>
    <label>
      ชื่อของท่าน
      <input v-model="name" placeholder="พิมพ์ชื่อ" />
    </label>
  </section>
</template>
