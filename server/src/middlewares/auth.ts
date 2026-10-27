import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import type { Role } from '@ssp/shared'
import { verifyToken, type AuthUser } from '../lib/token.ts'

// ชนิดของตัวแปรที่ middleware ฝากไว้ใน context ให้ handler อ่านด้วย c.get('user')
export type AuthEnv = {
  Variables: {
    user: AuthUser
  }
}

// ต้อง login: อ่าน JWT จาก cookie ชื่อ token ถ้าไม่มีหรือไม่ถูกต้องตอบ 401
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const token = getCookie(c, 'token')
  const user = token ? await verifyToken(token) : null
  if (!user) return c.json({ error: 'กรุณาเข้าสู่ระบบ' }, 401)

  c.set('user', user)
  await next()
})

// ต้องมีบทบาทที่กำหนด (ใช้ต่อจาก requireAuth) ถ้าไม่ใช่ตอบ 403
export function requireRole(role: Role) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    if (c.get('user').role !== role) return c.json({ error: 'ไม่มีสิทธิ์เข้าถึง' }, 403)
    await next()
  })
}
