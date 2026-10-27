import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ทดสอบกับฐานข้อมูลในหน่วยความจำ ไม่แตะไฟล์ data/app.sqlite
    env: { DATABASE_URL: ':memory:' },
    setupFiles: ['./src/test/setup.ts'],
  },
})
