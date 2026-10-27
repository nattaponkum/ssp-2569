import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ตาราง users: ชื่อ property ฝั่ง TypeScript เป็น camelCase
// ส่วนชื่อคอลัมน์ในฐานข้อมูลเป็น snake_case
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  lastname: text('lastname').notNull(),
  // เก็บเฉพาะ hash ของรหัสผ่าน ค่าเริ่มต้น '' ทำให้ migration เพิ่มคอลัมน์ในตารางที่มีข้อมูลแล้วได้
  // (ผู้ใช้เดิมที่ hash ว่างจะ login ไม่ได้จนกว่า admin ตั้งรหัสผ่านให้)
  passwordHash: text('password_hash').notNull().default(''),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
})
