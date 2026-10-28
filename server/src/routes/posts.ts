import { Hono } from 'hono'
import { idParamSchema, postCreateSchema, postQuerySchema, postUpdateSchema } from '@ssp/shared'
import { db } from '../db/client.ts'
import { hasText } from '../lib/html.ts'
import { zValidator } from '../lib/validator.ts'
import { requireAuth } from '../middlewares/auth.ts'
import { ImageService } from '../services/ImageService.ts'
import { PostService } from '../services/PostService.ts'

const postService = new PostService(db)
const imageService = new ImageService(db)

const NOT_FOUND = 'ไม่พบบทความ'
const FORBIDDEN = 'แก้ไขได้เฉพาะบทความของตัวเอง'
// editor ที่ว่างเปล่ายังส่ง <p></p> มา ผ่าน min(1) ของ Zod จึงต้องตรวจข้อความจริงอีกชั้น
const EMPTY_CONTENT = 'กรุณาใส่เนื้อหาบทความ'

// /api/posts: อ่านได้ทุกคน (เฉพาะที่เผยแพร่แล้ว) ส่วนการสร้าง แก้ไข ลบ ต้อง login
export const postsRoute = new Hono()
  // ?search=คำค้น&category=หมวด&cursor=id&limit=10
  .get('/', zValidator('query', postQuerySchema), async (c) => {
    return c.json(await postService.listPublished(c.req.valid('query')))
  })

  .get('/:id', zValidator('param', idParamSchema), async (c) => {
    const post = await postService.findPublishedById(c.req.valid('param').id)
    if (!post) return c.json({ error: NOT_FOUND }, 404)
    return c.json(post)
  })

  // ผู้เขียนคือผู้ที่ login อยู่ (ไม่รับ authorId จาก client)
  .post('/', requireAuth, zValidator('json', postCreateSchema), async (c) => {
    const data = c.req.valid('json')
    if (!hasText(data.content)) return c.json({ error: EMPTY_CONTENT }, 400)
    const post = await postService.create(c.get('user').id, data)
    return c.json(post, 201)
  })

  .patch(
    '/:id',
    requireAuth,
    zValidator('param', idParamSchema),
    zValidator('json', postUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const post = await postService.findById(id)
      if (!post) return c.json({ error: NOT_FOUND }, 404)
      // ตรวจความเป็นเจ้าของก่อนแก้ไข (authorization)
      if (!postService.canModify(c.get('user'), post)) return c.json({ error: FORBIDDEN }, 403)
      const data = c.req.valid('json')
      if (data.content !== undefined && !hasText(data.content)) {
        return c.json({ error: EMPTY_CONTENT }, 400)
      }

      const updated = await postService.update(id, data)
      // เปลี่ยนหรือเอารูปปกออกแล้ว ลบไฟล์รูปปกเดิมถ้าไม่มีบทความใดใช้อยู่
      if (post.thumbnail && post.thumbnail !== updated?.thumbnail) {
        await imageService.removeIfUnused(post.thumbnail)
      }
      return c.json(updated)
    },
  )

  .delete('/:id', requireAuth, zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const post = await postService.findById(id)
    if (!post) return c.json({ error: NOT_FOUND }, 404)
    if (!postService.canModify(c.get('user'), post)) return c.json({ error: FORBIDDEN }, 403)

    await postService.remove(id)
    if (post.thumbnail) await imageService.removeIfUnused(post.thumbnail)
    return c.body(null, 204)
  })

// /api/categories: รายชื่อหมวดหมู่สำหรับเมนู
export const categoriesRoute = new Hono().get('/', async (c) => {
  return c.json(await postService.listCategories())
})

// /api/admin/posts: หน้าจัดการบทความ เห็นฉบับร่างด้วย (admin เห็นทั้งหมด ผู้ใช้ทั่วไปเห็นของตัวเอง)
export const adminPostsRoute = new Hono()
  .use(requireAuth)
  .get('/', async (c) => {
    return c.json(await postService.listForUser(c.get('user')))
  })

  // อ่านบทความหนึ่งเรื่องเพื่อนำไปแก้ไข (รวมฉบับร่าง)
  .get('/:id', zValidator('param', idParamSchema), async (c) => {
    const post = await postService.findById(c.req.valid('param').id)
    if (!post) return c.json({ error: NOT_FOUND }, 404)
    if (!postService.canModify(c.get('user'), post)) return c.json({ error: FORBIDDEN }, 403)
    return c.json(post)
  })
