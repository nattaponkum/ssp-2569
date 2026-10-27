import { randomBytes } from 'node:crypto'
import { hashPassword } from '../lib/password.ts'
import { db } from './client.ts'
import { users } from './schema.ts'

// ข้อมูลตัวอย่าง รันด้วย npm run db:seed (รันซ้ำได้ เพราะข้ามอีเมลที่มีอยู่แล้ว)
// รหัสผ่านของ admin อ่านจาก server/.env ไม่เขียนไว้ในโค้ด
const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
const adminPassword = process.env.ADMIN_PASSWORD
if (!adminPassword || adminPassword.length < 8) {
  throw new Error('กรุณาตั้ง ADMIN_PASSWORD (อย่างน้อย 8 ตัวอักษร) ใน server/.env ก่อนรัน db:seed')
}

const sampleUsers = [
  {
    email: adminEmail,
    name: 'ผู้ดูแล',
    lastname: 'ระบบ',
    role: 'admin' as const,
    passwordHash: await hashPassword(adminPassword),
  },
  // ผู้ใช้ตัวอย่างได้รหัสผ่านสุ่มที่ไม่มีใครรู้ (admin ตั้งรหัสใหม่ให้ได้ในหน้าจัดการผู้ใช้)
  {
    email: 'somchai@example.com',
    name: 'สมชาย',
    lastname: 'ใจดี',
    passwordHash: await hashPassword(randomBytes(16).toString('hex')),
  },
  {
    email: 'somsri@example.com',
    name: 'สมศรี',
    lastname: 'รักเรียน',
    passwordHash: await hashPassword(randomBytes(16).toString('hex')),
  },
]

const inserted = db.insert(users).values(sampleUsers).onConflictDoNothing().returning().all()
console.log(`เพิ่มผู้ใช้ตัวอย่าง ${inserted.length} คน (admin: ${adminEmail})`)
