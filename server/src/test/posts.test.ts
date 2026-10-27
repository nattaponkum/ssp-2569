import { beforeAll, describe, it, expect } from 'vitest'
import { loginAs, send } from './helpers.ts'

let author = ''
let other = ''
let admin = ''

const draft = { title: 'ฉบับร่าง', content: 'ยังไม่เผยแพร่', category: 'ทั่วไป' }
const published = { ...draft, title: 'เผยแพร่แล้ว', status: 'published' }

beforeAll(async () => {
  author = (await loginAs('user')).cookie
  other = (await loginAs('user')).cookie
  admin = (await loginAs('admin')).cookie
})

async function createPost(cookie: string, data: object) {
  const res = await send('POST', '/api/posts', { cookie, body: data })
  return { res, post: await res.json() }
}

describe('POST /api/posts', () => {
  it('ไม่ login ได้ 401', async () => {
    expect((await send('POST', '/api/posts', { body: draft })).status).toBe(401)
  })

  it('สร้างได้ 201 ผู้เขียนคือผู้ที่ login และค่าเริ่มต้นเป็น draft', async () => {
    const { res, post } = await createPost(author, { ...draft, authorId: 999 })
    expect(res.status).toBe(201)
    expect(post).toMatchObject({ title: 'ฉบับร่าง', status: 'draft', authorName: 'user' })
    expect(post.authorId).not.toBe(999)
  })

  it('ข้อมูลไม่ครบได้ 400', async () => {
    const res = await send('POST', '/api/posts', { cookie: author, body: { title: '' } })
    expect(res.status).toBe(400)
  })
})

describe('อ่านบทความแบบสาธารณะ', () => {
  it('รายการแสดงเฉพาะบทความที่เผยแพร่ และมี excerpt แทน content', async () => {
    await createPost(author, draft)
    await createPost(author, published)

    const res = await send('GET', '/api/posts')
    expect(res.status).toBe(200)
    const list = await res.json()
    expect(list.length).toBeGreaterThan(0)
    for (const post of list) {
      expect(post.status).toBe('published')
      expect(post).toHaveProperty('excerpt')
      expect(post).not.toHaveProperty('content')
    }
  })

  it('อ่านฉบับร่างผ่าน /api/posts/:id ไม่ได้ (404) แต่ฉบับเผยแพร่ได้', async () => {
    const { post: d } = await createPost(author, draft)
    const { post: p } = await createPost(author, published)
    expect((await send('GET', `/api/posts/${d.id}`)).status).toBe(404)
    const res = await send('GET', `/api/posts/${p.id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveProperty('content', 'ยังไม่เผยแพร่')
  })
})

describe('ความเป็นเจ้าของบทความ', () => {
  it('เจ้าของแก้ไขได้ คนอื่นได้ 403 และ admin แก้ไขได้', async () => {
    const { post } = await createPost(author, draft)
    const path = `/api/posts/${post.id}`

    const byOther = await send('PATCH', path, { cookie: other, body: { title: 'แอบแก้' } })
    expect(byOther.status).toBe(403)

    const byOwner = await send('PATCH', path, { cookie: author, body: { status: 'published' } })
    expect(byOwner.status).toBe(200)
    expect(await byOwner.json()).toMatchObject({ status: 'published', title: 'ฉบับร่าง' })

    const byAdmin = await send('PATCH', path, { cookie: admin, body: { title: 'admin แก้' } })
    expect(byAdmin.status).toBe(200)
  })

  it('คนอื่นลบไม่ได้ (403) เจ้าของลบได้ (204)', async () => {
    const { post } = await createPost(author, draft)
    const path = `/api/posts/${post.id}`
    expect((await send('DELETE', path, { cookie: other })).status).toBe(403)
    expect((await send('DELETE', path, { cookie: author })).status).toBe(204)
    expect((await send('DELETE', path, { cookie: author })).status).toBe(404)
  })
})

describe('/api/admin/posts', () => {
  it('ต้อง login', async () => {
    expect((await send('GET', '/api/admin/posts')).status).toBe(401)
  })

  it('ผู้ใช้เห็นเฉพาะบทความของตัวเอง (รวมฉบับร่าง) admin เห็นทั้งหมด', async () => {
    const { post: mine } = await createPost(other, draft)

    const otherList = await (await send('GET', '/api/admin/posts', { cookie: other })).json()
    expect(otherList.every((p: { authorId: number }) => p.authorId === mine.authorId)).toBe(true)
    expect(otherList.some((p: { id: number }) => p.id === mine.id)).toBe(true)

    const adminList = await (await send('GET', '/api/admin/posts', { cookie: admin })).json()
    expect(adminList.length).toBeGreaterThan(otherList.length)
  })

  it('อ่านฉบับร่างของตัวเองเพื่อแก้ไขได้ แต่ของคนอื่นได้ 403', async () => {
    const { post } = await createPost(author, draft)
    const path = `/api/admin/posts/${post.id}`
    expect((await send('GET', path, { cookie: author })).status).toBe(200)
    expect((await send('GET', path, { cookie: other })).status).toBe(403)
  })
})

describe('เนื้อหา HTML และรูปปก (บทที่ 13)', () => {
  it('server sanitize เนื้อหาก่อนบันทึก และ excerpt ไม่มีแท็ก HTML', async () => {
    const { post } = await createPost(author, {
      ...published,
      content: '<p>สวัสดี<script>alert(1)</script></p><img src=x onerror=alert(1)>',
    })
    expect(post.content).toBe('<p>สวัสดี</p><img src="x" />')

    const list = await (await send('GET', '/api/posts')).json()
    const summary = list.find((p: { id: number }) => p.id === post.id)
    expect(summary.excerpt).toBe('สวัสดี')
  })

  it('รูปปกต้องเป็น path ใน /uploads/ เท่านั้น', async () => {
    const bad = await createPost(author, { ...draft, thumbnail: 'https://evil.example/a.png' })
    expect(bad.res.status).toBe(400)

    const thumbnail = '/uploads/123e4567-e89b-12d3-a456-426614174000.png'
    const good = await createPost(author, { ...draft, thumbnail })
    expect(good.res.status).toBe(201)
    expect(good.post.thumbnail).toBe(thumbnail)
  })
})
