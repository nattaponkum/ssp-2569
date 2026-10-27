import { z } from 'zod'
import { passwordSchema, userProfileSchema } from './user.ts'

// สมัครสมาชิก: ไม่มีฟิลด์ role ให้ส่ง (Zod ตัดฟิลด์แปลกปลอมทิ้ง) ผู้สมัครจึงเป็น user เสมอ
export const registerSchema = userProfileSchema.extend({
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
