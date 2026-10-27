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

// ตาราง posts: บทความหนึ่งเรื่องมีผู้เขียนหนึ่งคน (foreign key ไปที่ users.id)
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // ลบผู้ใช้แล้วบทความของผู้ใช้นั้นถูกลบตามไปด้วย (cascade)
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  // URL ของรูปปก เช่น /uploads/<ชื่อไฟล์> (ไม่มีรูปปกได้)
  thumbnail: text('thumbnail'),
  // mode 'timestamp' เก็บเป็นตัวเลขวินาทีในฐานข้อมูล แต่ใช้เป็น Date ในโค้ด
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})

// ตาราง images: ไฟล์รูปที่อัปโหลด เก็บแค่ข้อมูลของไฟล์ ส่วนตัวไฟล์อยู่ในโฟลเดอร์ uploads/
export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // ชื่อไฟล์ที่ server สุ่มขึ้นเอง (ไม่ใช้ชื่อไฟล์จากผู้ใช้)
  filename: text('filename').notNull().unique(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})
