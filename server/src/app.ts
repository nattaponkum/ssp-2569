import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { HTTPException } from 'hono/http-exception'
import { config } from './config.ts'
import { authRoute } from './routes/auth.ts'
import { adminPostsRoute, postsRoute } from './routes/posts.ts'
import { usersRoute } from './routes/users.ts'

// ทุก endpoint อยู่ใต้ /api ส่วน route ของแต่ละ resource แยกไว้ใน routes/
export const app = new Hono()
  // CORS: อนุญาตให้หน้าเว็บจาก origin ของ client (Vite dev server) เรียก API ข้าม origin ได้
  // credentials: true ให้ browser ส่ง/รับ cookie ด้วย (ใช้ในบทที่ 10)
  .use('/api/*', cors({ origin: config.CLIENT_ORIGIN, credentials: true }))
  // CSRF: request ที่แก้ไขข้อมูลแบบฟอร์มต้องมาจาก origin ที่อนุญาตเท่านั้น (ตรวจ header Origin)
  .use('/api/*', csrf({ origin: config.CLIENT_ORIGIN }))
  .get('/api/hello', (c) => c.json({ message: 'Hello Hono server' }))
  .route('/api/auth', authRoute)
  .route('/api/users', usersRoute)
  .route('/api/posts', postsRoute)
  .route('/api/admin/posts', adminPostsRoute)

// ไม่พบ route ที่ตรงกัน: ตอบ 404 รูปแบบเดียวกับ error อื่น
app.notFound((c) => c.json({ error: 'ไม่พบ endpoint นี้' }, 404))

// error ที่ไม่ได้จัดการ: ตอบรูปแบบ { error } และไม่ส่งรายละเอียดภายในให้ client
app.onError(async (err, c) => {
  // HTTPException คือ error ที่ตั้งใจโยนพร้อม status เช่น JSON ที่ส่งมาผิดรูปแบบ (400)
  // หรือ request ที่ไม่ผ่าน CSRF (403)
  if (err instanceof HTTPException) {
    const message = err.message || (await err.getResponse().text())
    return c.json({ error: message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, 500)
})

// ใช้กับ Hono RPC และการทดสอบ
export type AppType = typeof app
