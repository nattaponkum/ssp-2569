import { Hono } from 'hono'
import { idParamSchema, postCreateSchema, postUpdateSchema } from '@ssp/shared'
import { db } from '../db/client.ts'
import { zValidator } from '../lib/validator.ts'
import { requireAuth } from '../middlewares/auth.ts'
import { PostService } from '../services/PostService.ts'

const postService = new PostService(db)

const NOT_FOUND = 'ไม่พบบทความ'
const FORBIDDEN = 'แก้ไขได้เฉพาะบทความของตัวเอง'

// /api/posts: อ่านได้ทุกคน (เฉพาะที่เผยแพร่แล้ว) ส่วนการสร้าง แก้ไข ลบ ต้อง login
export const postsRoute = new Hono()
  .get('/', async (c) => {
    return c.json(await postService.listPublished())
  })

  .get('/:id', zValidator('param', idParamSchema), async (c) => {
    const post = await postService.findPublishedById(c.req.valid('param').id)
    if (!post) return c.json({ error: NOT_FOUND }, 404)
    return c.json(post)
  })

  // ผู้เขียนคือผู้ที่ login อยู่ (ไม่รับ authorId จาก client)
  .post('/', requireAuth, zValidator('json', postCreateSchema), async (c) => {
    const post = await postService.create(c.get('user').id, c.req.valid('json'))
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

      return c.json(await postService.update(id, c.req.valid('json')))
    },
  )

  .delete('/:id', requireAuth, zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const post = await postService.findById(id)
    if (!post) return c.json({ error: NOT_FOUND }, 404)
    if (!postService.canModify(c.get('user'), post)) return c.json({ error: FORBIDDEN }, 403)

    await postService.remove(id)
    return c.body(null, 204)
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
