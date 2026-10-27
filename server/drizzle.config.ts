import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL ?? './data/app.sqlite'

// drizzle-kit migrate เปิดไฟล์ฐานข้อมูลเอง จึงต้องมีโฟลเดอร์ data/ ก่อน
mkdirSync(dirname(url), { recursive: true })

// ตั้งค่า drizzle-kit: อ่าน schema แล้วสร้างไฟล์ migration (SQL) ไว้ในโฟลเดอร์ drizzle/
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
})
