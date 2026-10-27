import { beforeEach, describe, it, expect } from 'vitest'
import { db } from '../db/client.ts'
import { users } from '../db/schema.ts'
import { UserService } from '../services/UserService.ts'

// ทดสอบ class โดยตรงกับฐานข้อมูลในหน่วยความจำ (ดู vitest.config.ts และ setup.ts)
const service = new UserService(db)

describe('UserService (SQLite)', () => {
  // ล้างตารางก่อนทุก test เพื่อไม่ให้ข้อมูลค้างข้าม test
  beforeEach(() => {
    db.delete(users).run()
  })

  it('create แล้ว findById เจอ และ id ถูกสร้างให้อัตโนมัติ', async () => {
    const user = await service.create({ email: 'b@example.com', name: 'B', lastname: 'Two' })
    expect(user.id).toBeTypeOf('number')
    expect(await service.findById(user.id)).toEqual(user)
  })

  it('findAll คืนผู้ใช้ทั้งหมดเรียงตาม id', async () => {
    await service.create({ email: 'a@example.com', name: 'A', lastname: 'One' })
    await service.create({ email: 'b@example.com', name: 'B', lastname: 'Two' })
    const all = await service.findAll()
    expect(all.map((u) => u.email)).toEqual(['a@example.com', 'b@example.com'])
  })

  it('update เปลี่ยนเฉพาะฟิลด์ที่ส่งมา และคืน undefined ถ้าไม่พบ', async () => {
    const user = await service.create({ email: 'c@example.com', name: 'C', lastname: 'Three' })
    expect(await service.update(user.id, { name: 'CC' })).toMatchObject({
      name: 'CC',
      lastname: 'Three',
    })
    expect(await service.update(9999, { name: 'X' })).toBeUndefined()
  })

  it('remove คืน true เมื่อลบได้ และ false เมื่อไม่พบ', async () => {
    const user = await service.create({ email: 'd@example.com', name: 'D', lastname: 'Four' })
    expect(await service.remove(user.id)).toBe(true)
    expect(await service.remove(user.id)).toBe(false)
  })
})
