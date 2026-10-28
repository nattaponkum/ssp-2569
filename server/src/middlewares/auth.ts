import { deleteCookie, getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import type { Role } from '@ssp/shared'
import { db } from '../db/client.ts'
import { verifyToken, type AuthUser } from '../lib/token.ts'
import { UserService } from '../services/UserService.ts'

const userService = new UserService(db)

// ชนิดของตัวแปรที่ middleware ฝากไว้ใน context ให้ handler อ่านด้วย c.get('user')
export type AuthEnv = {
  Variables: {
    user: AuthUser
  }
}

// ต้อง login: อ่าน JWT จาก cookie ชื่อ token ถ้าไม่มีหรือไม่ถูกต้องตอบ 401
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const token = getCookie(c, 'token')
  const payload = token ? await verifyToken(token) : null
  // token ยังไม่หมดอายุไม่ได้แปลว่าผู้ใช้ยังอยู่ จึงอ่านผู้ใช้จากฐานข้อมูลทุกครั้ง:
  // - ถ้าผู้ใช้ถูกลบไปแล้ว ตอบ 401 และลบ cookie ทิ้ง
  // - ใช้ role ล่าสุดจากฐานข้อมูล ไม่ใช่ role ใน token (admin ถูกลดสิทธิ์แล้วจะมีผลทันที)
  const user = payload ? await userService.findById(payload.id) : undefined
  if (!user) {
    if (token) deleteCookie(c, 'token', { path: '/' })
    return c.json({ error: 'กรุณาเข้าสู่ระบบ' }, 401)
  }

  c.set('user', { id: user.id, role: user.role })
  await next()
})

// ต้องมีบทบาทที่กำหนด (ใช้ต่อจาก requireAuth) ถ้าไม่ใช่ตอบ 403
export function requireRole(role: Role) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    if (c.get('user').role !== role) return c.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, 403)
    await next()
  })
}
