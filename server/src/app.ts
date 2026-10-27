import { Hono } from 'hono'

// ข้อมูลผู้ใช้ที่ server เก็บและส่งกลับ (บทที่ 7 จะย้ายไปไว้ใน shared/ พร้อม Zod schema)
interface User {
  id: number
  email: string
  name: string
  lastname: string
}

// เก็บข้อมูลใน array ในหน่วยความจำ ข้อมูลจะหายเมื่อปิด server (บทที่ 6 เปลี่ยนไปใช้ฐานข้อมูล)
const users: User[] = [{ id: 1, email: 'somchai@example.com', name: 'สมชาย', lastname: 'ใจดี' }]
let nextId = 2

// ทุก endpoint อยู่ใต้ /api
export const app = new Hono()
  .get('/api/hello', (c) => c.json({ message: 'Hello Hono server' }))

  // อ่านผู้ใช้ทั้งหมด
  .get('/api/users', (c) => c.json(users))

  // อ่านผู้ใช้ตาม id (path parameter เป็น string เสมอ ต้องแปลงเป็นตัวเลขก่อน)
  .get('/api/users/:id', (c) => {
    const id = Number(c.req.param('id'))
    const user = users.find((u) => u.id === id)
    if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    return c.json(user)
  })

  // สร้างผู้ใช้ใหม่ ตอบ 201 Created
  .post('/api/users', async (c) => {
    // ยังไม่ได้ตรวจชนิดข้อมูลจริง แค่ "บอก" TypeScript ว่าน่าจะเป็นแบบนี้ (บทที่ 7 ใช้ Zod)
    const body = await c.req.json<Partial<User>>()
    if (!body.email || !body.name || !body.lastname) {
      return c.json({ error: 'กรุณาส่ง email, name และ lastname' }, 400)
    }
    const user: User = { id: nextId++, email: body.email, name: body.name, lastname: body.lastname }
    users.push(user)
    return c.json(user, 201)
  })

  // แก้ไขบางฟิลด์ (PATCH) ฟิลด์ที่ไม่ได้ส่งมาจะคงค่าเดิม
  .patch('/api/users/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const user = users.find((u) => u.id === id)
    if (!user) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)

    const body = await c.req.json<Partial<User>>()
    if (body.email) user.email = body.email
    if (body.name) user.name = body.name
    if (body.lastname) user.lastname = body.lastname
    return c.json(user)
  })

  // ลบผู้ใช้ ตอบ 204 No Content (ไม่มี body)
  .delete('/api/users/:id', (c) => {
    const id = Number(c.req.param('id'))
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return c.json({ error: 'ไม่พบผู้ใช้' }, 404)
    users.splice(index, 1)
    return c.body(null, 204)
  })

// ใช้กับ Hono RPC และการทดสอบ
export type AppType = typeof app
