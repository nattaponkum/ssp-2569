import { z } from 'zod'

// บทบาทของผู้ใช้: user เขียนบทความของตัวเอง, admin จัดการได้ทุกอย่าง
export const roleSchema = z.enum(['user', 'admin'])
export type Role = z.infer<typeof roleSchema>

// รหัสผ่านอย่างน้อย 8 ตัวอักษร (จำกัดความยาวสูงสุดกันการส่งข้อความยาวมากมาให้ hash)
export const passwordSchema = z.string().min(8).max(128)

// กฎของข้อมูลผู้ใช้ เขียนครั้งเดียว ใช้ทั้ง server (ตรวจ request) และ client (ตรวจฟอร์ม)
export const userProfileSchema = z.object({
  email: z.email().max(255),
  name: z.string().trim().min(1).max(100),
  lastname: z.string().trim().min(1).max(100),
})

// admin สร้างผู้ใช้: ต้องตั้งรหัสผ่าน และเลือกบทบาทได้ (ไม่ระบุ = user)
export const userCreateSchema = userProfileSchema.extend({
  password: passwordSchema,
  role: roleSchema.default('user'),
})

// แก้ไขได้ทีละบางฟิลด์ แต่ต้องส่งมาอย่างน้อยหนึ่งฟิลด์
// (สร้างจาก schema ที่ไม่มีค่า default เพื่อไม่ให้ role ถูกเปลี่ยนเป็น user เมื่อไม่ได้ส่งมา)
export const userUpdateSchema = userProfileSchema
  .extend({ password: passwordSchema, role: roleSchema })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { error: 'ต้องส่งข้อมูลอย่างน้อยหนึ่งฟิลด์' })

// path parameter เป็น string เสมอ z.coerce แปลงเป็นตัวเลขให้ก่อนตรวจ
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type UserCreate = z.infer<typeof userCreateSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>

// ข้อมูลผู้ใช้ที่ server ส่งกลับ (ไม่มีรหัสผ่านหรือ hash ใด ๆ)
export interface User {
  id: number
  email: string
  name: string
  lastname: string
  role: Role
}
