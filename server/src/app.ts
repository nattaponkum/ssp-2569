import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { config, isTest } from './config.ts'
import { errorHandler, notFound } from './middlewares/error-handler.ts'
import { authRoute } from './routes/auth.ts'
import { adminPostsRoute, categoriesRoute, postsRoute } from './routes/posts.ts'
import { uploadsRoute } from './routes/uploads.ts'
import { usersRoute } from './routes/users.ts'

// ทุก endpoint อยู่ใต้ /api ส่วน route ของแต่ละ resource แยกไว้ใน routes/
export const app = new Hono()
  // บันทึก request ทุกครั้ง: method, path, status และเวลาที่ใช้ (ปิดตอนทดสอบเพื่อไม่ให้รก)
  .use(logger(isTest ? () => {} : undefined))
  // header ด้านความปลอดภัยมาตรฐาน เช่น X-Content-Type-Options: nosniff, X-Frame-Options, HSTS
  // และ Content-Security-Policy: โหลด script/รูป/การเชื่อมต่อได้จากเว็บเราเองเป็นหลัก
  .use(
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // Vue และ TipTap ตั้ง style แบบ inline บางส่วน
        styleSrc: ["'self'", "'unsafe-inline'"],
        // รูปในบทความอาจลิงก์ไปยังเว็บอื่นแบบ https ได้ (sanitize-html อนุญาตไว้)
        imgSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    }),
  )
  // CORS: อนุญาตให้หน้าเว็บจาก origin ของ client (Vite dev server) เรียก API ข้าม origin ได้
  // credentials: true ให้ browser ส่ง/รับ cookie ด้วย (ใช้ในบทที่ 10)
  .use('/api/*', cors({ origin: config.CLIENT_ORIGIN, credentials: true }))
  // CSRF: request ที่แก้ไขข้อมูลแบบฟอร์มต้องมาจาก origin ที่อนุญาตเท่านั้น (ตรวจ header Origin)
  .use('/api/*', csrf({ origin: config.CLIENT_ORIGIN }))
  .get('/api/hello', (c) => c.json({ message: 'Hello Hono server' }))
  .route('/api/auth', authRoute)
  .route('/api/users', usersRoute)
  .route('/api/posts', postsRoute)
  .route('/api/categories', categoriesRoute)
  .route('/api/admin/posts', adminPostsRoute)
  .route('/api/uploads', uploadsRoute)

// เสิร์ฟไฟล์ที่อัปโหลด: /uploads/<ชื่อไฟล์> อ่านจากโฟลเดอร์ UPLOAD_DIR
// (สร้างโฟลเดอร์ไว้ก่อนถ้ายังไม่มี; header nosniff มาจาก secureHeaders ข้างบนแล้ว)
mkdirSync(config.UPLOAD_DIR, { recursive: true })
app.use(
  '/uploads/*',
  serveStatic({
    root: config.UPLOAD_DIR,
    rewriteRequestPath: (path) => path.replace(/^\/uploads/, ''),
  }),
)

// production: เสิร์ฟหน้าเว็บ (ผลของ npm run build ฝั่ง client) จาก origin เดียวกับ API
// ทำงานเฉพาะเมื่อมี client/dist/index.html อยู่จริง ตอนพัฒนาใช้ Vite dev server แทน
const indexHtml = join(config.CLIENT_DIST, 'index.html')
if (existsSync(indexHtml)) {
  // ไฟล์ที่มีอยู่จริง เช่น /assets/index-abc123.js, /favicon.ico
  app.use('/*', serveStatic({ root: config.CLIENT_DIST }))
  // SPA fallback: path อื่น (เช่น /posts/5, /admin/posts) ส่ง index.html ให้ Vue Router จัดการต่อ
  // ยกเว้น /api และ /uploads ที่ต้องตอบ 404 ตามจริง
  app.get('*', async (c, next) => {
    if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/uploads/')) return next()
    return serveStatic({ path: indexHtml })(c, next)
  })
}

app.notFound(notFound)
app.onError(errorHandler)

// ใช้กับ Hono RPC และการทดสอบ
export type AppType = typeof app
