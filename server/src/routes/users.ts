import { Hono } from 'hono'
import { idParamSchema, userCreateSchema, userUpdateSchema } from '@ssp/shared'
import { db } from '../db/client.ts'
import { zValidator } from '../lib/validator.ts'
import { UserService, type UserRepository } from '../services/UserService.ts'

// Model: service ที่ดูแลข้อมูลผู้ใช้ (สร้างครั้งเดียว ใช้ร่วมกันทุก request)
const userService: UserRepository = new UserService(db)

const EMAIL_TAKEN = 'อีเมลนี้ถูกใช้แล้ว'

// Controller: รับ request ตรวจ input เรียก service แล้วตอบ JSON
// zValidator ตรวจข้อมูลก่อนถึง handler ถ้าไม่ผ่านจะตอบ 400 ทันที
// c.req.valid() จึงได้ข้อมูลที่ผ่านการตรวจและมีชนิดถูกต้องแล้ว
export const usersRoute = new Hono()
  .get('/', async (c) => {
    return c.json(await userService.findAll())
  })

  .get('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const user = await userService.findById(id)
    if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.json(user)
  })

  .post('/', zValidator('json', userCreateSchema), async (c) => {
    const data = c.req.valid('json')
    if (await userService.findByEmail(data.email)) return c.json({ error: EMAIL_TAKEN }, 409)
    const user = await userService.create(data)
    return c.json(user, 201)
  })

  .patch(
    '/:id',
    zValidator('param', idParamSchema),
    zValidator('json', userUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param')
      const data = c.req.valid('json')
      if (data.email) {
        const owner = await userService.findByEmail(data.email)
        if (owner && owner.id !== id) return c.json({ error: EMAIL_TAKEN }, 409)
      }
      const user = await userService.update(id, data)
      if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
      return c.json(user)
    },
  )

  .delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')
    const deleted = await userService.remove(id)
    if (!deleted) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.body(null, 204)
  })
