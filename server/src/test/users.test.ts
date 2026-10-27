import { beforeAll, describe, it, expect } from 'vitest'
import { app } from '../app.ts'
import { loginAs, send } from './helpers.ts'

// app.request() ส่ง Request เข้า app โดยตรง ไม่ต้องเปิด server จริง
// ตั้งแต่บทที่ 10 /api/users ใช้ได้เฉพาะ admin จึง login เป็น admin ก่อนทุก test ในไฟล์นี้
let admin = ''
let adminId = 0
beforeAll(async () => {
  const result = await loginAs('admin')
  admin = result.cookie
  adminId = result.user.id
})

const newUser = {
  email: 'somsri@example.com',
  name: 'สมศรี',
  lastname: 'รักเรียน',
  password: 'password1234',
}

describe('GET /api/hello', () => {
  it('ตอบข้อความทักทาย', async () => {
    const res = await app.request('/api/hello')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello Hono server' })
  })
})

describe('CORS', () => {
  it('อนุญาต origin ของ client และส่ง cookie ข้าม origin ได้', async () => {
    const res = await app.request('/api/users', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
      },
    })
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
  })

  it('ไม่อนุญาต origin อื่น', async () => {
    const res = await app.request('/api/users', { headers: { Origin: 'https://evil.example' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})

describe('/api/users', () => {
  it('GET คืนรายชื่อผู้ใช้เป็น array', async () => {
    const res = await send('GET', '/api/users', { cookie: admin })
    expect(res.status).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })

  it('สร้าง อ่าน แก้ไข และลบผู้ใช้ได้', async () => {
    const created = await send('POST', '/api/users', { cookie: admin, body: newUser })
    expect(created.status).toBe(201)
    const user = await created.json()
    expect(user).toMatchObject({ email: 'somsri@example.com', name: 'สมศรี', role: 'user' })

    const found = await send('GET', `/api/users/${user.id}`, { cookie: admin })
    expect(found.status).toBe(200)

    const updated = await send('PATCH', `/api/users/${user.id}`, {
      cookie: admin,
      body: { name: 'สมศรีใหม่' },
    })
    expect(updated.status).toBe(200)
    expect(await updated.json()).toMatchObject({ name: 'สมศรีใหม่', lastname: 'รักเรียน' })

    const deleted = await send('DELETE', `/api/users/${user.id}`, { cookie: admin })
    expect(deleted.status).toBe(204)

    const missing = await send('GET', `/api/users/${user.id}`, { cookie: admin })
    expect(missing.status).toBe(404)
  })

  it('ไม่ส่งรหัสผ่านหรือ hash กลับไปใน response', async () => {
    const res = await send('GET', '/api/users', { cookie: admin })
    const text = await res.text()
    expect(text).not.toContain('password')
    expect(text).not.toContain('scrypt$')
  })

  it('PATCH ที่ไม่ส่ง role มา ไม่เปลี่ยน role เดิม', async () => {
    const res = await send('PATCH', `/api/users/${adminId}`, { cookie: admin, body: { name: 'A' } })
    expect((await res.json()).role).toBe('admin')
  })

  it('PATCH และ DELETE ผู้ใช้ที่ไม่มีอยู่ได้ 404', async () => {
    const patch = await send('PATCH', '/api/users/999', { cookie: admin, body: { name: 'x' } })
    expect(patch.status).toBe(404)
    expect((await send('DELETE', '/api/users/999', { cookie: admin })).status).toBe(404)
  })

  it('admin ลบบัญชีตัวเองไม่ได้', async () => {
    const res = await send('DELETE', `/api/users/${adminId}`, { cookie: admin })
    expect(res.status).toBe(400)
  })
})

describe('การตรวจสอบ input ด้วย Zod', () => {
  it('POST ที่ข้อมูลไม่ครบได้ 400 พร้อมรายการ issues', async () => {
    const res = await send('POST', '/api/users', {
      cookie: admin,
      body: { email: 'x@example.com' },
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid input')
    expect(body.issues.map((i: { path: string[] }) => i.path[0])).toEqual([
      'name',
      'lastname',
      'password',
    ])
  })

  it('อีเมลผิดรูปแบบหรือรหัสผ่านสั้นเกินได้ 400', async () => {
    const badEmail = await send('POST', '/api/users', {
      cookie: admin,
      body: { ...newUser, email: 'abc' },
    })
    expect(badEmail.status).toBe(400)
    const shortPassword = await send('POST', '/api/users', {
      cookie: admin,
      body: { ...newUser, email: 'short@example.com', password: '123' },
    })
    expect(shortPassword.status).toBe(400)
  })

  it('id ที่ไม่ใช่ตัวเลขได้ 400', async () => {
    const res = await send('GET', '/api/users/abc', { cookie: admin })
    expect(res.status).toBe(400)
  })

  it('PATCH ที่ไม่มีฟิลด์ใดเลยได้ 400', async () => {
    const res = await send('PATCH', `/api/users/${adminId}`, { cookie: admin, body: {} })
    expect(res.status).toBe(400)
  })

  it('JSON ผิดรูปแบบได้ 400 รูปแบบ { error }', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: admin },
      body: '{ not json',
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('error')
  })

  it('ฟิลด์แปลกปลอม (เช่น id) ถูกตัดทิ้ง', async () => {
    const res = await send('POST', '/api/users', {
      cookie: admin,
      body: { ...newUser, id: 500, email: 'extra@example.com' },
    })
    expect(res.status).toBe(201)
    expect((await res.json()).id).not.toBe(500)
  })

  it('อีเมลซ้ำได้ 409 Conflict ทั้งตอนสร้างและแก้ไข', async () => {
    const data = { ...newUser, email: 'dup@example.com' }
    expect((await send('POST', '/api/users', { cookie: admin, body: data })).status).toBe(201)
    expect((await send('POST', '/api/users', { cookie: admin, body: data })).status).toBe(409)

    const other = await (
      await send('POST', '/api/users', {
        cookie: admin,
        body: { ...data, email: 'other@example.com' },
      })
    ).json()
    const res = await send('PATCH', `/api/users/${other.id}`, {
      cookie: admin,
      body: { email: 'dup@example.com' },
    })
    expect(res.status).toBe(409)
  })

  it('path ที่ไม่มีอยู่ได้ 404 รูปแบบ { error }', async () => {
    const res = await app.request('/api/nope')
    expect(res.status).toBe(404)
    expect(await res.json()).toHaveProperty('error')
  })
})
