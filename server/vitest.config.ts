import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ทดสอบกับฐานข้อมูลในหน่วยความจำ ไม่แตะไฟล์ data/app.sqlite
    env: {
      DATABASE_URL: ':memory:',
      // ค่าสำหรับการทดสอบเท่านั้น ของจริงอยู่ใน server/.env
      JWT_SECRET: 'test-secret-for-vitest-only-0123456789',
      // ไฟล์ที่อัปโหลดระหว่างทดสอบไปอยู่ในโฟลเดอร์ชั่วคราวของระบบ
      UPLOAD_DIR: join(tmpdir(), 'ssp-2569-test-uploads'),
    },
    setupFiles: ['./src/test/setup.ts'],
  },
})
