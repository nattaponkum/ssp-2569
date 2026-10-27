import { db } from './client.ts'
import { users } from './schema.ts'

// ข้อมูลตัวอย่าง รันด้วย npm run db:seed (รันซ้ำได้ เพราะข้ามอีเมลที่มีอยู่แล้ว)
const sampleUsers = [
  { email: 'somchai@example.com', name: 'สมชาย', lastname: 'ใจดี' },
  { email: 'somsri@example.com', name: 'สมศรี', lastname: 'รักเรียน' },
]

const inserted = db.insert(users).values(sampleUsers).onConflictDoNothing().returning().all()
console.log(`เพิ่มผู้ใช้ตัวอย่าง ${inserted.length} คน`)
