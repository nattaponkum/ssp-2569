import { z } from 'zod'

// ตรวจค่า env ทั้งหมดตอนเริ่มโปรแกรม ถ้าขาดหรือผิด ให้หยุดทันทีพร้อมบอกว่าผิดตรงไหน
// (ดีกว่าไปพังกลางทางตอนมีผู้ใช้ login ครั้งแรก) ที่อื่นในโปรแกรมอ่าน env ผ่าน config นี้เท่านั้น
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8081),
  // ไฟล์ฐานข้อมูล SQLite (':memory:' = ในหน่วยความจำ ใช้ตอนทดสอบ)
  DATABASE_URL: z.string().default('./data/app.sqlite'),
  // กุญแจลับสำหรับเซ็น JWT ต้องยาวพอที่จะเดาไม่ได้
  JWT_SECRET: z.string().min(32),
  // origin ที่อนุญาตให้เรียก API และส่ง cookie
  // (production คือ URL จริงของเว็บ เช่น https://blog.example.com)
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
  // โฟลเดอร์เก็บไฟล์ที่ผู้ใช้อัปโหลด (อยู่ใน .gitignore)
  UPLOAD_DIR: z.string().default('./uploads'),
  // โฟลเดอร์ผลลัพธ์ของ npm run build ฝั่ง client (ถ้ามี server จะเสิร์ฟหน้าเว็บให้ด้วย)
  CLIENT_DIST: z.string().default('../client/dist'),
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  const hint = 'คัดลอก server/.env.example เป็น server/.env แล้วแก้ไข'
  throw new Error(`ค่า env ไม่ถูกต้อง (${hint})\n${z.prettifyError(result.error)}`)
}

export const config = result.data
export const isProduction = config.NODE_ENV === 'production'
export const isTest = config.NODE_ENV === 'test'
