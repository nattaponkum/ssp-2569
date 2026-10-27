import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { userCreateSchema, type User } from '@ssp/shared'

// ข้อมูลจำลองในหน่วยความจำ (บทที่ 6 จะเปลี่ยนไปใช้ฐานข้อมูลด้วย Drizzle)
const users: User[] = [{ id: 1, email: 'somchai@example.com', name: 'สมชาย', lastname: 'ใจดี' }]

const routes = new Hono()
  .get('/hello', (c) => c.json({ message: 'Hello Hono server' }))
  .get('/users', (c) => c.json(users))
  .get('/user/:userId', (c) => {
    const user = users.find((u) => u.id === Number(c.req.param('userId')))
    if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.json(user)
  })
  .post('/user', zValidator('json', userCreateSchema), (c) => {
    const { email, name, lastname } = c.req.valid('json')
    const user: User = { id: users.length + 1, email, name, lastname }
    users.push(user)
    return c.json(user, 201)
  })

export const app = new Hono()
  .use('*', cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
  .route('/', routes)

// ใช้กับ Hono RPC client (hc) ฝั่ง Vue ในบทที่ 9
export type AppType = typeof app
