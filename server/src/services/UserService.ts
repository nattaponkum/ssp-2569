import { eq } from 'drizzle-orm'
import type { Db } from '../db/client.ts'
import { users } from '../db/schema.ts'

// ชนิดข้อมูลได้มาจาก schema โดยตรง ไม่ต้องเขียนซ้ำ
export type User = typeof users.$inferSelect
export type NewUser = Omit<typeof users.$inferInsert, 'id'>

// สัญญา (contract) ว่าที่เก็บข้อมูลผู้ใช้ต้องทำอะไรได้บ้าง
// route รู้จักแค่ interface นี้ จึงไม่สนว่าข้างในเก็บข้อมูลไว้ที่ใด
export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: number): Promise<User | undefined>
  findByEmail(email: string): Promise<User | undefined>
  create(data: NewUser): Promise<User>
  update(id: number, data: Partial<NewUser>): Promise<User | undefined>
  remove(id: number): Promise<boolean>
}

// เก็บผู้ใช้ในฐานข้อมูล SQLite ผ่าน Drizzle ORM (interface เดิม เปลี่ยนแค่ไส้ใน)
export class UserService implements UserRepository {
  private db: Db

  // รับ db เข้ามาทาง constructor (dependency injection) ตอนทดสอบจึงส่งฐานข้อมูลอื่นเข้ามาได้
  constructor(db: Db) {
    this.db = db
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(users).orderBy(users.id)
  }

  async findById(id: number): Promise<User | undefined> {
    return this.db.select().from(users).where(eq(users.id, id)).get()
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db.select().from(users).where(eq(users.email, email)).get()
  }

  async create(data: NewUser): Promise<User> {
    // returning() ขอแถวที่เพิ่งบันทึกกลับมา (รวม id ที่ฐานข้อมูลสร้างให้)
    return this.db.insert(users).values(data).returning().get()
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    // ถ้าไม่มีฟิลด์ให้แก้ ก็คืนข้อมูลเดิม (Drizzle ไม่ยอมให้ set ค่าว่าง)
    if (Object.values(data).every((value) => value === undefined)) return this.findById(id)
    return this.db.update(users).set(data).where(eq(users.id, id)).returning().get()
  }

  async remove(id: number): Promise<boolean> {
    const result = this.db.delete(users).where(eq(users.id, id)).run()
    return result.changes > 0
  }
}
