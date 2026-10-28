import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { LoginInput, RegisterInput, User } from '@ssp/shared'
import type { Db } from '../db/client.ts'
import { users } from '../db/schema.ts'
import { hashPassword, verifyPassword } from '../lib/password.ts'
import { UserService } from './UserService.ts'

// hash ของรหัสผ่านสุ่มที่ไม่มีใครรู้ ใช้ตรวจแทนเมื่อไม่พบอีเมล (สร้างครั้งแรกที่ต้องใช้แล้วเก็บไว้)
let dummyHash: Promise<string> | undefined
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomUUID())
  return dummyHash
}

// business logic ของการพิสูจน์ตัวตน: สมัครสมาชิกและตรวจรหัสผ่าน
// (การสร้าง/ตรวจ JWT อยู่ใน lib/token.ts ส่วนการตั้ง cookie อยู่ใน routes/auth.ts)
export class AuthService {
  private db: Db
  private userService: UserService

  constructor(db: Db) {
    this.db = db
    // ใช้ UserService ซ้ำ (composition) แทนการเขียนโค้ดบันทึกผู้ใช้ใหม่อีกรอบ
    this.userService = new UserService(db)
  }

  // คืน undefined ถ้าอีเมลซ้ำ
  async register(data: RegisterInput): Promise<User | undefined> {
    if (await this.userService.findByEmail(data.email)) return undefined
    // ผู้สมัครเองได้บทบาท user เสมอ ไม่ว่าจะส่งอะไรมา
    return this.userService.create({ ...data, role: 'user' })
  }

  // คืนข้อมูลผู้ใช้ถ้าอีเมลและรหัสผ่านถูกต้อง ไม่เช่นนั้นคืน undefined
  async login(data: LoginInput): Promise<User | undefined> {
    const row = this.db.select().from(users).where(eq(users.email, data.email)).get()
    // ไม่พบอีเมลก็ยังคำนวณ scrypt กับ hash หลอก ให้เวลาตอบใกล้เคียงกับกรณีรหัสผ่านผิด
    // ผู้โจมตีจึงจับเวลาเพื่อเดาว่าอีเมลใดมีบัญชีอยู่ไม่ได้
    const storedHash = row?.passwordHash ?? (await getDummyHash())
    const passwordOk = await verifyPassword(data.password, storedHash)
    if (!row || !passwordOk) return undefined

    // ตัด passwordHash ออกก่อนส่งกลับ
    const { passwordHash: _, ...user } = row
    return user
  }
}
