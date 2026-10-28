import { Hono, type Context } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'
import { deleteCookie, setCookie } from 'hono/cookie'
import { loginSchema, registerSchema, type User } from '@ssp/shared'
import { isProduction } from '../config.ts'
import { db } from '../db/client.ts'
import { signToken, TOKEN_MAX_AGE } from '../lib/token.ts'
import { zValidator } from '../lib/validator.ts'
import { requireAuth } from '../middlewares/auth.ts'
import { failureRateLimit } from '../middlewares/rate-limit.ts'
import { AuthService } from '../services/AuthService.ts'
import { UserService } from '../services/UserService.ts'

const authService = new AuthService(db)
const userService = new UserService(db)

// เก็บ JWT ใน cookie แบบ httpOnly: JavaScript ในหน้าเว็บอ่านไม่ได้
// จึงปลอดภัยจากการขโมยผ่าน XSS มากกว่าการเก็บใน localStorage
async function setTokenCookie(c: Context, user: User) {
  setCookie(c, 'token', await signToken(user), {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isProduction, // production ใช้ HTTPS เท่านั้น
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  })
}

// IP ของผู้เชื่อมต่อ (ถ้ามี reverse proxy เช่น Caddy จะเป็น IP ของ proxy
// กุญแจจึงมีอีเมลด้วย ห้ามเชื่อ header X-Forwarded-For ตรง ๆ เพราะผู้โจมตีปลอมได้)
function clientIp(c: Context): string {
  try {
    return getConnInfo(c).remote.address ?? 'unknown'
  } catch {
    return 'unknown' // เช่น ตอนทดสอบด้วย app.request() ที่ไม่มี socket จริง
  }
}

// login ผิดได้ 5 ครั้งต่อ IP + อีเมล ใน 15 นาที เกินนั้นตอบ 429 จนกว่าจะครบเวลา
const loginRateLimit = failureRateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  key: async (c) => {
    // อ่าน body ก่อน zValidator ได้ เพราะ Hono เก็บ body ที่อ่านแล้วไว้ให้อ่านซ้ำ
    const body: { email?: unknown } = await c.req.json().catch(() => ({}))
    return `${clientIp(c)}|${String(body.email ?? '').toLowerCase()}`
  },
  isFailure: (res) => res.status === 401,
  message: 'เข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่',
})

export const authRoute = new Hono()
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const user = await authService.register(c.req.valid('json'))
    if (!user) return c.json({ error: 'อีเมลนี้ถูกใช้แล้ว' }, 409)
    await setTokenCookie(c, user)
    return c.json(user, 201)
  })

  .post('/login', loginRateLimit, zValidator('json', loginSchema), async (c) => {
    const user = await authService.login(c.req.valid('json'))
    // ไม่บอกว่าผิดที่อีเมลหรือรหัสผ่าน เพื่อไม่ให้ผู้ไม่หวังดีรู้ว่าอีเมลใดมีบัญชีอยู่
    if (!user) return c.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)
    await setTokenCookie(c, user)
    return c.json(user)
  })

  .post('/logout', (c) => {
    deleteCookie(c, 'token', { path: '/' })
    return c.body(null, 204)
  })

  // ข้อมูลผู้ใช้ที่ login อยู่ (อ่านจากฐานข้อมูลใหม่ทุกครั้ง เผื่อถูกแก้ไขหรือลบไปแล้ว)
  .get('/me', requireAuth, async (c) => {
    const user = await userService.findById(c.get('user').id)
    if (!user) return c.json({ error: 'กรุณาเข้าสู่ระบบ' }, 401)
    return c.json(user)
  })
