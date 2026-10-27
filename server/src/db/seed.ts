import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../lib/password.ts'
import { db } from './client.ts'
import { posts, users } from './schema.ts'

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

// บทความตัวอย่าง (เพิ่มเฉพาะเมื่อยังไม่มีบทความเลย) ผู้เขียนคือ admin
const admin = db.select().from(users).where(eq(users.email, adminEmail)).get()
const hasPosts = db.select().from(posts).limit(1).get()
if (admin && !hasPosts) {
  const samplePosts = [
    {
      title: 'ยินดีต้อนรับสู่บล็อก',
      content: 'บทความแรกของบล็อกนี้ เขียนด้วย Hono, Drizzle และ Vue',
      category: 'ข่าวสาร',
      status: 'published' as const,
    },
    {
      title: 'เริ่มต้นเขียน TypeScript ฝั่งเซิร์ฟเวอร์',
      content: 'Node.js 24 รันไฟล์ .ts ได้โดยตรง โดยไม่ต้องติดตั้งเครื่องมือเพิ่ม',
      category: 'บทเรียน',
      status: 'published' as const,
    },
    {
      title: 'ฉบับร่าง: แผนบทความถัดไป',
      content: 'บทความนี้ยังไม่เผยแพร่ ผู้อ่านทั่วไปจึงมองไม่เห็น',
      category: 'บทเรียน',
      status: 'draft' as const,
    },
  ]
  db.insert(posts)
    .values(samplePosts.map((post) => ({ ...post, authorId: admin.id })))
    .run()
  console.log(`เพิ่มบทความตัวอย่าง ${samplePosts.length} เรื่อง`)
}
