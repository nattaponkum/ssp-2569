import { z } from 'zod'

// บทความเป็นฉบับร่าง (draft) หรือเผยแพร่แล้ว (published) ผู้อ่านทั่วไปเห็นเฉพาะ published
export const postStatusSchema = z.enum(['draft', 'published'])
export type PostStatus = z.infer<typeof postStatusSchema>

const postFields = {
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(100_000),
  category: z.string().trim().min(1).max(50),
}

export const postCreateSchema = z.object({
  ...postFields,
  status: postStatusSchema.default('draft'),
})

// แก้ไขทีละบางฟิลด์ได้ (ไม่มี default เพื่อไม่ให้ status ถูกเปลี่ยนเมื่อไม่ได้ส่งมา)
export const postUpdateSchema = z
  .object({ ...postFields, status: postStatusSchema })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { error: 'ต้องส่งข้อมูลอย่างน้อยหนึ่งฟิลด์' })

export type PostCreate = z.infer<typeof postCreateSchema>
export type PostUpdate = z.infer<typeof postUpdateSchema>

// บทความที่ server ส่งกลับ (วันที่เป็นข้อความรูปแบบ ISO เพราะ JSON ไม่มีชนิด Date)
export interface Post {
  id: number
  authorId: number
  authorName: string
  title: string
  content: string
  category: string
  status: PostStatus
  createdAt: string
  updatedAt: string
}

// บทความในหน้ารายการ: ไม่ส่งเนื้อหาเต็ม ส่งแค่ข้อความย่อ (excerpt)
export type PostSummary = Omit<Post, 'content'> & { excerpt: string }
