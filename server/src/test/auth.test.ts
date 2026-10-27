import { describe, it, expect } from 'vitest'
import { app } from '../app.ts'
import { loginAs, PASSWORD, send, tokenCookie } from './helpers.ts'

const somchai = {
  email: 'somchai@example.com',
  name: 'สมชาย',
  lastname: 'ใจดี',
  password: PASSWORD,
}

describe('สมัครสมาชิกและเข้าสู่ระบบ', () => {
  it('register ได้ 201 พร้อม cookie httpOnly และได้ role user เสมอ', async () => {
    const res = await send('POST', '/api/auth/register', { body: { ...somchai, role: 'admin' } })
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ email: somchai.email, role: 'user' })

    const setCookie = res.headers.get('Set-Cookie') ?? ''
    expect(setCookie).toContain('token=')
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Lax')
  })

  it('register อีเมลซ้ำได้ 409', async () => {
    const res = await send('POST', '/api/auth/register', { body: somchai })
    expect(res.status).toBe(409)
  })

  it('login รหัสผ่านผิดได้ 401 และไม่มี cookie', async () => {
    const res = await send('POST', '/api/auth/login', {
      body: { email: somchai.email, password: 'wrong-password' },
    })
    expect(res.status).toBe(401)
    expect(res.headers.get('Set-Cookie')).toBeNull()
  })

  it('login อีเมลที่ไม่มีอยู่ได้ 401 ข้อความเดียวกัน', async () => {
    const res = await send('POST', '/api/auth/login', {
      body: { email: 'nobody@example.com', password: PASSWORD },
    })
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  })

  it('login ถูกต้อง แล้วใช้ cookie เรียก /me ได้', async () => {
    const login = await send('POST', '/api/auth/login', {
      body: { email: somchai.email, password: PASSWORD },
    })
    expect(login.status).toBe(200)

    const me = await send('GET', '/api/auth/me', { cookie: tokenCookie(login) })
    expect(me.status).toBe(200)
    const body = await me.json()
    expect(body).toMatchObject({ email: somchai.email, role: 'user' })
    expect(body).not.toHaveProperty('passwordHash')
  })

  it('logout ลบ cookie', async () => {
    const res = await send('POST', '/api/auth/logout')
    expect(res.status).toBe(204)
    expect(res.headers.get('Set-Cookie')).toContain('Max-Age=0')
  })
})

describe('การป้องกัน endpoint', () => {
  it('/me ที่ไม่มี cookie หรือ token ปลอมได้ 401', async () => {
    expect((await send('GET', '/api/auth/me')).status).toBe(401)
    expect((await send('GET', '/api/auth/me', { cookie: 'token=fake.token.value' })).status).toBe(
      401,
    )
  })

  it('/api/users: ไม่ login ได้ 401, user ได้ 403, admin ได้ 200', async () => {
    const user = await loginAs('user')
    const admin = await loginAs('admin')
    expect((await send('GET', '/api/users')).status).toBe(401)
    expect((await send('GET', '/api/users', { cookie: user.cookie })).status).toBe(403)
    expect((await send('GET', '/api/users', { cookie: admin.cookie })).status).toBe(200)
  })

  it('CSRF: request แบบฟอร์มจาก origin อื่นถูกปฏิเสธ 403', async () => {
    const res = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: {
        Origin: 'https://evil.example',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'a=1',
    })
    expect(res.status).toBe(403)
    expect(await res.json()).toHaveProperty('error')
  })
})
