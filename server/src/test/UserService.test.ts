import { beforeEach, describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.ts'
import { users } from '../db/schema.ts'
import { UserService } from '../services/UserService.ts'

// ทดสอบ class โดยตรงกับฐานข้อมูลในหน่วยความจำ (ดู vitest.config.ts และ setup.ts)
const service = new UserService(db)

// ข้อมูลผู้ใช้ตัวอย่าง (บทที่ 10 เพิ่ม password และ role)
function sample(email: string, name: string) {
  return { email, name, lastname: 'Test', password: 'password1234', role: 'user' as const }
}

describe('UserService (SQLite)', () => {
  // ล้างตารางก่อนทุก test เพื่อไม่ให้ข้อมูลค้างข้าม test
  beforeEach(() => {
    db.delete(users).run()
  })

  it('create แล้ว findById เจอ และ id ถูกสร้างให้อัตโนมัติ', async () => {
    const user = await service.create(sample('b@example.com', 'B'))
    expect(user.id).toBeTypeOf('number')
    expect(await service.findById(user.id)).toEqual(user)
  })

  it('findAll คืนผู้ใช้ทั้งหมดเรียงตาม id', async () => {
    await service.create(sample('a@example.com', 'A'))
    await service.create(sample('b@example.com', 'B'))
    const all = await service.findAll()
    expect(all.map((u) => u.email)).toEqual(['a@example.com', 'b@example.com'])
  })

  it('update เปลี่ยนเฉพาะฟิลด์ที่ส่งมา และคืน undefined ถ้าไม่พบ', async () => {
    const user = await service.create(sample('c@example.com', 'C'))
    expect(await service.update(user.id, { name: 'CC' })).toMatchObject({
      name: 'CC',
      lastname: 'Test',
    })
    expect(await service.update(9999, { name: 'X' })).toBeUndefined()
  })

  it('remove คืน true เมื่อลบได้ และ false เมื่อไม่พบ', async () => {
    const user = await service.create(sample('d@example.com', 'D'))
    expect(await service.remove(user.id)).toBe(true)
    expect(await service.remove(user.id)).toBe(false)
  })

  it('เก็บรหัสผ่านเป็น hash และไม่คืน passwordHash ออกจาก service', async () => {
    const user = await service.create(sample('e@example.com', 'E'))
    expect(user).not.toHaveProperty('passwordHash')
    const row = db.select().from(users).where(eq(users.id, user.id)).get()
    expect(row?.passwordHash).toMatch(/^scrypt\$/)
  })
})
