import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

// ตำแหน่งไฟล์ฐานข้อมูล อ่านจาก env DATABASE_URL (ตอนทดสอบใช้ ':memory:' คือฐานข้อมูลในหน่วยความจำ)
const url = process.env.DATABASE_URL ?? './data/app.sqlite'

// better-sqlite3 สร้างไฟล์ให้เอง แต่ไม่สร้างโฟลเดอร์ให้
if (url !== ':memory:') mkdirSync(dirname(url), { recursive: true })

const sqlite = new Database(url)
// ให้ SQLite ตรวจ foreign key (เช่น posts.author_id ต้องมีอยู่จริงใน users)
sqlite.pragma('foreign_keys = ON')

export const db = drizzle({ client: sqlite })
export type Db = typeof db
