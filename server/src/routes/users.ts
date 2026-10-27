import { Hono } from 'hono'
import { db } from '../db/client.ts'
import { UserService, type NewUser, type UserRepository } from '../services/UserService.ts'

// Model: service ที่ดูแลข้อมูลผู้ใช้ (สร้างครั้งเดียว ใช้ร่วมกันทุก request)
const userService: UserRepository = new UserService(db)

// Controller: รับ request ตรวจ input เรียก service แล้วตอบ JSON
// path ในไฟล์นี้เป็น path ย่อย เพราะ app.ts mount ไว้ที่ /api/users
export const usersRoute = new Hono()
  .get('/', async (c) => {
    return c.json(await userService.findAll())
  })

  .get('/:id', async (c) => {
    const user = await userService.findById(Number(c.req.param('id')))
    if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.json(user)
  })

  .post('/', async (c) => {
    const body = await c.req.json<Partial<NewUser>>()
    if (!body.email || !body.name || !body.lastname) {
      return c.json({ error: 'กรุณาส่ง email, name และ lastname' }, 400)
    }
    const user = await userService.create({
      email: body.email,
      name: body.name,
      lastname: body.lastname,
    })
    return c.json(user, 201)
  })

  .patch('/:id', async (c) => {
    const body = await c.req.json<Partial<NewUser>>()
    // ส่งเฉพาะฟิลด์ที่อนุญาตให้แก้ ไม่ส่ง body ทั้งก้อน (กันการแก้ id)
    const user = await userService.update(Number(c.req.param('id')), {
      email: body.email,
      name: body.name,
      lastname: body.lastname,
    })
    if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.json(user)
  })

  .delete('/:id', async (c) => {
    const deleted = await userService.remove(Number(c.req.param('id')))
    if (!deleted) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.body(null, 204)
  })
