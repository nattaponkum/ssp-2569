import { beforeAll, describe, it, expect } from 'vitest'
import { app } from '../app.ts'
import { detectImageType } from '../lib/file-type.ts'
import { MAX_UPLOAD_SIZE } from '../services/ImageService.ts'
import { loginAs, ORIGIN, send } from './helpers.ts'

// PNG ขนาด 1x1 พิกเซล (ไฟล์รูปจริงที่เล็กที่สุดแบบหนึ่ง)
const PNG_1PX = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  ),
  (ch) => ch.charCodeAt(0),
)

let owner = ''
let other = ''

beforeAll(async () => {
  owner = (await loginAs('user')).cookie
  other = (await loginAs('user')).cookie
})

// ส่งไฟล์แบบ multipart/form-data เหมือนฟอร์มอัปโหลดของ browser
function upload(cookie: string, data: Uint8Array<ArrayBuffer>, filename: string, type: string) {
  const form = new FormData()
  form.append('file', new File([data], filename, { type }))
  return app.request('/api/uploads', {
    method: 'POST',
    headers: { Origin: ORIGIN, Cookie: cookie },
    body: form,
  })
}

describe('detectImageType (magic bytes)', () => {
  it('รู้จัก PNG และไม่รับข้อความธรรมดาแม้ตั้งชื่อเป็น .png', () => {
    expect(detectImageType(PNG_1PX)).toEqual({ mime: 'image/png', ext: 'png' })
    expect(detectImageType(new TextEncoder().encode('<svg onload=alert(1)>'))).toBeNull()
  })

  it('รู้จัก JPEG, GIF และ WebP', () => {
    expect(detectImageType(Uint8Array.of(0xff, 0xd8, 0xff, 0xe0))?.ext).toBe('jpg')
    expect(detectImageType(new TextEncoder().encode('GIF89a'))?.ext).toBe('gif')
    expect(detectImageType(new TextEncoder().encode('RIFF____WEBPVP8 '))?.ext).toBe('webp')
  })
})

describe('POST /api/uploads', () => {
  it('ไม่ login ได้ 401', async () => {
    expect((await upload('', PNG_1PX, 'a.png', 'image/png')).status).toBe(401)
  })

  it('อัปโหลด PNG ได้ 201 ชื่อไฟล์ถูกสุ่มใหม่ และเปิดดูได้ที่ /uploads/...', async () => {
    const res = await upload(owner, PNG_1PX, '../../evil name.png', 'image/png')
    expect(res.status).toBe(201)
    const image = await res.json()
    expect(image.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/)

    const file = await app.request(image.url)
    expect(file.status).toBe(200)
    expect(file.headers.get('Content-Type')).toBe('image/png')
    expect(file.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('ไฟล์ที่ไม่ใช่รูป (แม้ส่ง type เป็น image/png) ได้ 415', async () => {
    const html = new TextEncoder().encode('<script>alert(1)</script>')
    expect((await upload(owner, html, 'x.png', 'image/png')).status).toBe(415)
  })

  it('ไฟล์ใหญ่เกิน 2 MB ได้ 413', async () => {
    const big = new Uint8Array(MAX_UPLOAD_SIZE + 1)
    big.set(PNG_1PX)
    expect((await upload(owner, big, 'big.png', 'image/png')).status).toBe(413)
  })

  it('ไม่แนบไฟล์ได้ 400', async () => {
    const res = await app.request('/api/uploads', {
      method: 'POST',
      headers: { Origin: ORIGIN, Cookie: owner },
      body: new FormData(),
    })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/uploads/:id', () => {
  it('คนอื่นลบไม่ได้ (403) เจ้าของลบได้ (204) แล้วไฟล์หายไป', async () => {
    const image = await (await upload(owner, PNG_1PX, 'a.png', 'image/png')).json()
    const del = (cookie: string) =>
      app.request(`/api/uploads/${image.id}`, {
        method: 'DELETE',
        headers: { Origin: ORIGIN, Cookie: cookie },
      })

    expect((await del(other)).status).toBe(403)
    expect((await del(owner)).status).toBe(204)
    expect((await app.request(image.url)).status).toBe(404)
  })
})

describe('ทบทวนความปลอดภัย (บทที่ 15)', () => {
  it('ตั้ง Content-Type เป็น multipart เองแต่ไม่มี boundary ได้ 400 ไม่ใช่ 500', async () => {
    const res = await app.request('/api/uploads', {
      method: 'POST',
      headers: { Origin: ORIGIN, Cookie: owner, 'Content-Type': 'multipart/form-data' },
      body: 'not really multipart',
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('error')
  })

  it('เปลี่ยนรูปปกแล้วไฟล์รูปปกเดิมที่ไม่มีใครใช้ถูกลบ', async () => {
    const first = await (await upload(owner, PNG_1PX, 'a.png', 'image/png')).json()
    const second = await (await upload(owner, PNG_1PX, 'b.png', 'image/png')).json()
    const post = await (
      await send('POST', '/api/posts', {
        cookie: owner,
        body: { title: 'ปก', content: '<p>มีปก</p>', category: 'ทดสอบ', thumbnail: first.url },
      })
    ).json()

    await send('PATCH', `/api/posts/${post.id}`, { cookie: owner, body: { thumbnail: second.url } })
    expect((await app.request(first.url)).status).toBe(404)
    expect((await app.request(second.url)).status).toBe(200)
  })

  it('ลบผู้ใช้แล้วไฟล์รูปของผู้ใช้นั้นถูกลบจากดิสก์ด้วย', async () => {
    const admin = await loginAs('admin')
    const temp = await loginAs('user')
    const image = await (await upload(temp.cookie, PNG_1PX, 'a.png', 'image/png')).json()

    await send('DELETE', `/api/users/${temp.user.id}`, { cookie: admin.cookie })
    expect((await app.request(image.url)).status).toBe(404)
  })
})
