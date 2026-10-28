import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

// ห้ามเก็บรหัสผ่านตรง ๆ ให้เก็บ hash ที่ได้จาก scrypt
// (ฟังก์ชันที่ตั้งใจให้คำนวณช้าและใช้หน่วยความจำมาก ผู้โจมตีจึงเดาแบบ brute force ได้ยาก)
//
// รูปแบบที่เก็บ: scrypt$<N>$<r>$<p>$<salt แบบ hex>$<hash แบบ hex>
// เก็บพารามิเตอร์ไว้ใน hash ด้วย วันหน้าเพิ่มความยากได้โดย hash เก่ายังตรวจได้
// (รูปแบบเดิมของบทที่ 10 คือ scrypt$<salt>$<hash> ใช้ค่าเริ่มต้นของ Node: N=16384, r=8, p=1)
const KEY_LENGTH = 64

// ค่าขั้นต่ำที่ OWASP Password Storage Cheat Sheet แนะนำ
const COST = { N: 2 ** 17, r: 8, p: 1 }
const LEGACY_COST = { N: 2 ** 14, r: 8, p: 1 }

// scrypt ใช้หน่วยความจำประมาณ 128 * N * r ไบต์ (= 128 MiB สำหรับค่าข้างบน)
// แต่ Node ตั้งเพดานเริ่มต้นไว้ 32 MiB จึงต้องขยาย maxmem
const MAX_MEMORY = 256 * 1024 * 1024

interface Cost {
  N: number
  r: number
  p: number
}

// ห่อ scrypt แบบ callback ให้เป็น Promise จะได้ใช้ await ได้
function scryptAsync(password: string, salt: Buffer, keyLength: number, cost: Cost) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, { ...cost, maxmem: MAX_MEMORY }, (err, key) =>
      err ? reject(err) : resolve(key),
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  // salt สุ่มใหม่ทุกครั้ง รหัสผ่านเดียวกันจึงได้ hash ไม่ซ้ำกัน
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, KEY_LENGTH, COST)
  const { N, r, p } = COST
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${hash.toString('hex')}`
}

// แยกส่วนของ hash ที่เก็บไว้ รองรับทั้งรูปแบบใหม่ (6 ส่วน) และรูปแบบเดิม (3 ส่วน)
function parseHash(stored: string) {
  const parts = stored.split('$')
  if (parts[0] !== 'scrypt') return null
  if (parts.length === 3) return { cost: LEGACY_COST, saltHex: parts[1]!, hashHex: parts[2]! }
  if (parts.length === 6) {
    const [N, r, p] = parts.slice(1, 4).map(Number)
    if (![N, r, p].every((n) => Number.isSafeInteger(n) && n! > 0)) return null
    return { cost: { N: N!, r: r!, p: p! }, saltHex: parts[4]!, hashHex: parts[5]! }
  }
  return null
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored)
  if (!parsed || !parsed.saltHex || !parsed.hashHex) return false

  const expected = Buffer.from(parsed.hashHex, 'hex')
  // hash ที่ยาวไม่ครบ (ข้อมูลเสียหรือถูกแก้) ถือว่าไม่ผ่าน ไม่เช่นนั้น hash ว่างจะ "ตรงกัน" เสมอ
  if (expected.length !== KEY_LENGTH) return false
  const salt = Buffer.from(parsed.saltHex, 'hex')
  const actual = await scryptAsync(password, salt, expected.length, parsed.cost)
  // timingSafeEqual ใช้เวลาเท่ากันไม่ว่าจะต่างกันที่ไบต์ไหน ผู้โจมตีจึงจับเวลาเพื่อเดาไม่ได้
  return timingSafeEqual(actual, expected)
}
