import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // ระหว่างพัฒนา: ส่งต่อคำขอ /uploads/... ไปที่ server (รูปในบทความใช้ path แบบ /uploads/<ไฟล์>)
  server: {
    proxy: {
      '/uploads': 'http://localhost:8081',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
