import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { usersRoute } from './routes/users.ts'

// ทุก endpoint อยู่ใต้ /api ส่วน route ของแต่ละ resource แยกไว้ใน routes/
export const app = new Hono()
  // CORS: อนุญาตให้หน้าเว็บจาก origin ของ client (Vite dev server) เรียก API ข้าม origin ได้
  // credentials: true ให้ browser ส่ง/รับ cookie ด้วย (ใช้ในบทที่ 10)
  .use(
    '/api/*',
    cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }),
  )
  .get('/api/hello', (c) => c.json({ message: 'Hello Hono server' }))
  .route('/api/users', usersRoute)

// ไม่พบ route ที่ตรงกัน: ตอบ 404 รูปแบบเดียวกับ error อื่น
app.notFound((c) => c.json({ error: 'ไม่พบ endpoint นี้' }, 404))

// error ที่ไม่ได้จัดการ: ตอบรูปแบบ { error } และไม่ส่งรายละเอียดภายในให้ client
app.onError((err, c) => {
  // HTTPException คือ error ที่ตั้งใจโยนพร้อม status เช่น JSON ที่ส่งมาผิดรูปแบบ (400)
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, 500)
})

// ใช้กับ Hono RPC และการทดสอบ
export type AppType = typeof app
