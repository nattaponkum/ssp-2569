import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

// ห้ามเก็บรหัสผ่านตรง ๆ ให้เก็บ hash ที่ได้จาก scrypt
// (ฟังก์ชันที่ตั้งใจให้คำนวณช้า ผู้โจมตีจึงเดาแบบ brute force ได้ยาก)
// รูปแบบที่เก็บ: scrypt$<salt แบบ hex>$<hash แบบ hex>
const KEY_LENGTH = 64

// ห่อ scrypt แบบ callback ให้เป็น Promise จะได้ใช้ await ได้
function scryptAsync(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (err, key) => (err ? reject(err) : resolve(key)))
  })
}

export async function hashPassword(password: string): Promise<string> {
  // salt สุ่มใหม่ทุกครั้ง รหัสผ่านเดียวกันจึงได้ hash ไม่ซ้ำกัน
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = stored.split('$')
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length)
  // timingSafeEqual ใช้เวลาเท่ากันไม่ว่าจะต่างกันที่ไบต์ไหน ผู้โจมตีจึงจับเวลาเพื่อเดาไม่ได้
  return timingSafeEqual(actual, expected)
}
