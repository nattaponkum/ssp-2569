import { describe, it, expect } from 'vitest'
import { app } from '../app.ts'

// app.request() ส่ง Request เข้า app โดยตรง ไม่ต้องเปิด server จริง
function sendJson(method: string, path: string, body: unknown) {
  return app.request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/hello', () => {
  it('ตอบข้อความทักทาย', async () => {
    const res = await app.request('/api/hello')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello Hono server' })
  })
})

describe('/api/users', () => {
  it('GET คืนรายชื่อผู้ใช้เป็น array', async () => {
    const res = await app.request('/api/users')
    expect(res.status).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })

  it('สร้าง อ่าน แก้ไข และลบผู้ใช้ได้', async () => {
    const created = await sendJson('POST', '/api/users', {
      email: 'somsri@example.com',
      name: 'สมศรี',
      lastname: 'รักเรียน',
    })
    expect(created.status).toBe(201)
    const user = await created.json()
    expect(user).toMatchObject({ email: 'somsri@example.com', name: 'สมศรี' })

    const found = await app.request(`/api/users/${user.id}`)
    expect(found.status).toBe(200)

    const updated = await sendJson('PATCH', `/api/users/${user.id}`, { name: 'สมศรีใหม่' })
    expect(updated.status).toBe(200)
    expect(await updated.json()).toMatchObject({ name: 'สมศรีใหม่', lastname: 'รักเรียน' })

    const deleted = await app.request(`/api/users/${user.id}`, { method: 'DELETE' })
    expect(deleted.status).toBe(204)

    const missing = await app.request(`/api/users/${user.id}`)
    expect(missing.status).toBe(404)
  })

  it('PATCH และ DELETE ผู้ใช้ที่ไม่มีอยู่ได้ 404', async () => {
    expect((await sendJson('PATCH', '/api/users/999', { name: 'x' })).status).toBe(404)
    expect((await app.request('/api/users/999', { method: 'DELETE' })).status).toBe(404)
  })
})

describe('การตรวจสอบ input ด้วย Zod', () => {
  it('POST ที่ข้อมูลไม่ครบได้ 400 พร้อมรายการ issues', async () => {
    const res = await sendJson('POST', '/api/users', { email: 'x@example.com' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid input')
    expect(body.issues.map((i: { path: string[] }) => i.path[0])).toEqual(['name', 'lastname'])
  })

  it('อีเมลผิดรูปแบบได้ 400', async () => {
    const res = await sendJson('POST', '/api/users', { email: 'abc', name: 'A', lastname: 'B' })
    expect(res.status).toBe(400)
  })

  it('id ที่ไม่ใช่ตัวเลขได้ 400', async () => {
    const res = await app.request('/api/users/abc')
    expect(res.status).toBe(400)
  })

  it('PATCH ที่ไม่มีฟิลด์ใดเลยได้ 400', async () => {
    const res = await sendJson('PATCH', '/api/users/1', {})
    expect(res.status).toBe(400)
  })

  it('JSON ผิดรูปแบบได้ 400 รูปแบบ { error }', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not json',
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('error')
  })

  it('ฟิลด์แปลกปลอม (เช่น id) ถูกตัดทิ้ง', async () => {
    const res = await sendJson('POST', '/api/users', {
      id: 500,
      email: 'extra@example.com',
      name: 'E',
      lastname: 'X',
    })
    expect(res.status).toBe(201)
    expect((await res.json()).id).not.toBe(500)
  })

  it('อีเมลซ้ำได้ 409 Conflict ทั้งตอนสร้างและแก้ไข', async () => {
    const data = { email: 'dup@example.com', name: 'D', lastname: 'U' }
    expect((await sendJson('POST', '/api/users', data)).status).toBe(201)
    expect((await sendJson('POST', '/api/users', data)).status).toBe(409)

    const other = await (
      await sendJson('POST', '/api/users', { ...data, email: 'other@example.com' })
    ).json()
    const res = await sendJson('PATCH', `/api/users/${other.id}`, { email: 'dup@example.com' })
    expect(res.status).toBe(409)
  })

  it('path ที่ไม่มีอยู่ได้ 404 รูปแบบ { error }', async () => {
    const res = await app.request('/api/nope')
    expect(res.status).toBe(404)
    expect(await res.json()).toHaveProperty('error')

  })
})
