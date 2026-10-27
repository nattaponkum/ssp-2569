import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ตาราง users: ชื่อ property ฝั่ง TypeScript เป็น camelCase ส่วนชื่อคอลัมน์ในฐานข้อมูลเป็น snake_case
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  lastname: text('lastname').notNull(),
})
