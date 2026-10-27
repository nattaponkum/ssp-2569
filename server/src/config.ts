import { z } from 'zod'

// ตรวจค่า env ตอนเริ่มโปรแกรม ถ้าขาดหรือผิด ให้หยุดทันทีพร้อมบอกว่าผิดตรงไหน
// (ดีกว่าไปพังกลางทางตอนมีผู้ใช้ login ครั้งแรก)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // กุญแจลับสำหรับเซ็น JWT ต้องยาวพอที่จะเดาไม่ได้
  JWT_SECRET: z.string().min(32),
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  const hint = 'คัดลอก server/.env.example เป็น server/.env แล้วแก้ไข'
  throw new Error(`ค่า env ไม่ถูกต้อง (${hint})\n${z.prettifyError(result.error)}`)
}

export const config = result.data
export const isProduction = config.NODE_ENV === 'production'
