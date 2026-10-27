import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ทดสอบกับฐานข้อมูลในหน่วยความจำ ไม่แตะไฟล์ data/app.sqlite
    env: {
      DATABASE_URL: ':memory:',
      // ค่าสำหรับการทดสอบเท่านั้น ของจริงอยู่ใน server/.env
      JWT_SECRET: 'test-secret-for-vitest-only-0123456789',
    },
    setupFiles: ['./src/test/setup.ts'],
  },
})
