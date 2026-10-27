import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../db/client.ts'

// สร้างตารางในฐานข้อมูลทดสอบจากไฟล์ migration ชุดเดียวกับที่ใช้จริง
migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) })
