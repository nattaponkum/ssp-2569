import { describe, it, expect } from 'vitest'
import { UserService } from '../services/UserService.ts'

// ทดสอบ class โดยตรง สร้าง object ใหม่ทุกครั้งจึงไม่มีข้อมูลค้างจาก test อื่น
describe('UserService (in-memory)', () => {
  it('รับข้อมูลเริ่มต้นผ่าน constructor และกำหนด id ให้อัตโนมัติ', async () => {
    const service = new UserService([{ email: 'a@example.com', name: 'A', lastname: 'One' }])
    expect(await service.findAll()).toEqual([
      { id: 1, email: 'a@example.com', name: 'A', lastname: 'One' },
    ])
  })

  it('create แล้ว findById เจอ', async () => {
    const service = new UserService()
    const user = await service.create({ email: 'b@example.com', name: 'B', lastname: 'Two' })
    expect(await service.findById(user.id)).toEqual(user)
  })

  it('update เปลี่ยนเฉพาะฟิลด์ที่ส่งมา และคืน undefined ถ้าไม่พบ', async () => {
    const service = new UserService([{ email: 'c@example.com', name: 'C', lastname: 'Three' }])
    expect(await service.update(1, { name: 'CC' })).toMatchObject({ name: 'CC', lastname: 'Three' })
    expect(await service.update(99, { name: 'X' })).toBeUndefined()
  })

  it('remove คืน true เมื่อลบได้ และ false เมื่อไม่พบ', async () => {
    const service = new UserService([{ email: 'd@example.com', name: 'D', lastname: 'Four' }])
    expect(await service.remove(1)).toBe(true)
    expect(await service.remove(1)).toBe(false)
  })
})
