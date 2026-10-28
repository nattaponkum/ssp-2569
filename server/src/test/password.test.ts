import { randomBytes, scryptSync } from 'node:crypto'
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../lib/password.ts'

describe('password (scrypt)', () => {
  it('hash อยู่ในรูปแบบ scrypt$N$r$p$salt$hash และไม่มีรหัสผ่านเดิมปนอยู่', async () => {
    const hash = await hashPassword('my-secret-password')
    expect(hash).toMatch(/^scrypt\$131072\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
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
    expect(await verifyPassword('correct-horse', 'scrypt$1$2')).toBe(false)
    expect(await verifyPassword('correct-horse', 'scrypt$x$8$1$aa$bb')).toBe(false)
  })

  it('hash รูปแบบเดิม scrypt$salt$hash (ค่าเริ่มต้นของ Node) ยังตรวจได้', async () => {
    const salt = randomBytes(16)
    const hash = scryptSync('old-pass', salt, 64)
    const legacy = `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
    expect(await verifyPassword('old-pass', legacy)).toBe(true)
    expect(await verifyPassword('other-pass', legacy)).toBe(false)
  })
})
