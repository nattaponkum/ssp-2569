import { z } from 'zod'

// กฎของข้อมูลผู้ใช้ เขียนครั้งเดียว ใช้ทั้ง server (ตรวจ request) และ client (ตรวจฟอร์ม)
export const userCreateSchema = z.object({
  email: z.email().max(255),
  name: z.string().trim().min(1).max(100),
  lastname: z.string().trim().min(1).max(100),
})

// แก้ไขได้ทีละบางฟิลด์ แต่ต้องส่งมาอย่างน้อยหนึ่งฟิลด์
export const userUpdateSchema = userCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { error: 'ต้องส่งข้อมูลอย่างน้อยหนึ่งฟิลด์' })

// path parameter เป็น string เสมอ z.coerce แปลงเป็นตัวเลขให้ก่อนตรวจ
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type UserCreate = z.infer<typeof userCreateSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>

// ข้อมูลผู้ใช้ที่ server ส่งกลับ
export interface User {
  id: number
  email: string
  name: string
  lastname: string
}
