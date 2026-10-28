import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeAll, describe, it, expect, vi } from 'vitest'

// จำลองโฟลเดอร์ client/dist (ผลของ npm run build) แล้วโหลด app ใหม่ให้อ่าน CLIENT_DIST นี้
const dist = join(tmpdir(), 'ssp-2569-test-dist')
let app: (typeof import('../app.ts'))['app']

beforeAll(async () => {
  mkdirSync(join(dist, 'assets'), { recursive: true })
  writeFileSync(join(dist, 'index.html'), '<!doctype html><div id="app"></div>')
  writeFileSync(join(dist, 'assets', 'main.js'), 'console.log(1)')
  process.env.CLIENT_DIST = dist
  vi.resetModules()
  app = (await import('../app.ts')).app
})

describe('เสิร์ฟหน้าเว็บของ client (production)', () => {
  it('ไฟล์ที่มีอยู่จริงส่งตามชนิดไฟล์', async () => {
    const res = await app.request('/assets/main.js')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('javascript')
  })

  it('path ของ Vue Router (เช่น /posts/5) ได้ index.html (SPA fallback)', async () => {
    const res = await app.request('/posts/5')
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<div id="app">')
  })

  it('/api ที่ไม่มีอยู่ยังได้ 404 แบบ JSON ไม่ใช่ index.html', async () => {
    const res = await app.request('/api/nope')
    expect(res.status).toBe(404)
    expect(await res.json()).toHaveProperty('error')
  })

  it('ทุก response มี security headers', async () => {
    const res = await app.request('/posts/5')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'")
  })
})
