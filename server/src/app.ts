import { Hono } from 'hono'
import { usersRoute } from './routes/users.ts'

// ทุก endpoint อยู่ใต้ /api ส่วน route ของแต่ละ resource แยกไว้ใน routes/
export const app = new Hono()
  .get('/api/hello', (c) => c.json({ message: 'Hello Hono server' }))
  .route('/api/users', usersRoute)

// ใช้กับ Hono RPC และการทดสอบ
export type AppType = typeof app
