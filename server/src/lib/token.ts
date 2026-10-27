import { sign, verify } from 'hono/jwt'
import { roleSchema, type Role } from '@ssp/shared'
import { z } from 'zod'
import { config } from '../config.ts'

// อายุของ token (วินาที) ใช้ทั้งใน JWT และอายุ cookie
export const TOKEN_MAX_AGE = 60 * 60

// ผู้ใช้ที่ login อยู่ ตามข้อมูลใน token
export interface AuthUser {
  id: number
  role: Role
}

// payload ใน JWT มีแค่ที่จำเป็น: sub (id ผู้ใช้), role และเวลาหมดอายุ
const payloadSchema = z.object({ sub: z.number(), role: roleSchema })

export function signToken(user: AuthUser): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE
  return sign({ sub: user.id, role: user.role, exp }, config.JWT_SECRET, 'HS256')
}

// คืน AuthUser ถ้า token ถูกต้องและยังไม่หมดอายุ ไม่เช่นนั้นคืน null
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = payloadSchema.parse(await verify(token, config.JWT_SECRET, 'HS256'))
    return { id: payload.sub, role: payload.role }
  } catch {
    return null
  }
}
