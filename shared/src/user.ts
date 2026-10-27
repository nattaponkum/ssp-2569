import { z } from 'zod'

// ข้อมูลที่ client ส่งมาตอนสร้างผู้ใช้ (ใช้ตรวจสอบทั้งฝั่ง server และฟอร์มฝั่ง client)
export const userCreateSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
  lastname: z.string().min(1),
})

export type UserCreate = z.infer<typeof userCreateSchema>

// ข้อมูลผู้ใช้ที่ server ส่งกลับ (ไม่มี password)
export interface User {
  id: number
  email: string
  name: string
  lastname: string
}
