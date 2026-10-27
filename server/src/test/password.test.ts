import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../lib/password.ts'

describe('password (scrypt)', () => {
  it('hash อยู่ในรูปแบบ scrypt$salt$hash และไม่มีรหัสผ่านเดิมปนอยู่', async () => {
    const hash = await hashPassword('my-secret-password')
    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
    expect(hash).not.toContain('my-secret-password')
  })

  it('รหัสผ่านเดียวกัน hash สองครั้งได้ค่าไม่เหมือนกัน (เพราะ salt ต่างกัน)', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'))
  })

  it('verify ถูกเมื่อรหัสผ่านตรง และผิดเมื่อไม่ตรงหรือ hash เสีย', async () => {
    const hash = await hashPassword('correct-horse')
    expect(await verifyPassword('correct-horse', hash)).toBe(true)
    expect(await verifyPassword('wrong-horse', hash)).toBe(false)
    expect(await verifyPassword('correct-horse', '')).toBe(false)
  })
})
