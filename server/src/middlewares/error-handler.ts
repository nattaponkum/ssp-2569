import type { ErrorHandler, NotFoundHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

// ไม่พบ route ที่ตรงกัน: ตอบ 404 รูปแบบเดียวกับ error อื่น
export const notFound: NotFoundHandler = (c) => {
  return c.json({ error: 'ไม่พบ endpoint นี้' }, 404)
}

// error handler กลาง: ทุก error ที่หลุดจาก handler มาจบที่นี่ ตอบรูปแบบ { error } เสมอ
export const errorHandler: ErrorHandler = async (err, c) => {
  // HTTPException คือ error ที่ตั้งใจโยนพร้อม status เช่น JSON ที่ส่งมาผิดรูปแบบ (400)
  // หรือ request ที่ไม่ผ่าน CSRF (403)
  if (err instanceof HTTPException) {
    const message = err.message || (await err.getResponse().text())
    return c.json({ error: message }, err.status)
  }

  // error ที่ไม่คาดคิด: บันทึกรายละเอียดไว้ใน log ฝั่ง server
  // แต่ไม่ส่ง stack trace หรือข้อความภายในให้ client (อาจเปิดเผยโครงสร้างระบบ)
  console.error(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`, err)
  return c.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, 500)
}
