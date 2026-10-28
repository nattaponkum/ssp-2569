import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { idParamSchema } from '@ssp/shared'
import { db } from '../db/client.ts'
import { detectImageType } from '../lib/file-type.ts'
import { zValidator } from '../lib/validator.ts'
import { requireAuth } from '../middlewares/auth.ts'
import { ImageService, MAX_UPLOAD_SIZE } from '../services/ImageService.ts'

const imageService = new ImageService(db)

const TOO_LARGE = 'ไฟล์ใหญ่เกิน 2 MB'

// /api/uploads: อัปโหลดและลบรูป ต้อง login
export const uploadsRoute = new Hono()
  .use(requireAuth)

  .post(
    '/',
    // ชั้นแรก: ตัด request ที่ body ใหญ่เกินตั้งแต่ยังอ่านไม่จบ
    // (เผื่อพื้นที่ให้ส่วนหัวของ multipart อีกเล็กน้อย)
    bodyLimit({
      maxSize: MAX_UPLOAD_SIZE + 64 * 1024,
      onError: (c) => c.json({ error: TOO_LARGE }, 413),
    }),
    async (c) => {
      // multipart/form-data: ไฟล์อยู่ในฟิลด์ชื่อ file
      // ถ้า body ไม่ใช่ multipart ที่ถูกต้อง (เช่น ตั้ง Content-Type เองแต่ไม่มี boundary)
      // parseBody จะโยน error จึงดักไว้แล้วตอบ 400
      const body = await c.req.parseBody().catch(() => null)
      if (!body) return c.json({ error: 'ต้องส่งไฟล์แบบ multipart/form-data' }, 400)
      const file = body.file
      if (!(file instanceof File)) return c.json({ error: 'กรุณาแนบไฟล์ในฟิลด์ file' }, 400)
      // ชั้นที่สอง: ตรวจขนาดของไฟล์เอง
      if (file.size > MAX_UPLOAD_SIZE) return c.json({ error: TOO_LARGE }, 413)

      // ชั้นที่สาม: ตรวจเนื้อไฟล์จริงว่าเป็นรูปที่รองรับ
      const data = new Uint8Array(await file.arrayBuffer())
      const type = detectImageType(data)
      if (!type) return c.json({ error: 'รองรับเฉพาะไฟล์ PNG, JPEG, WebP และ GIF' }, 415)

      const image = await imageService.save(c.get('user').id, data, type)
      return c.json(image, 201)
    },
  )

  .delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const image = await imageService.findById(id)
    if (!image) return c.json({ error: 'ไม่พบไฟล์' }, 404)
    if (!imageService.canModify(c.get('user'), image)) {
      return c.json({ error: 'ลบได้เฉพาะไฟล์ของตัวเอง' }, 403)
    }

    await imageService.remove(id)
    return c.body(null, 204)
  })
