import type { Role } from '@ssp/shared'
import { app } from '../app.ts'
import { db } from '../db/client.ts'
import { UserService } from '../services/UserService.ts'

// origin ของ client ที่ server อนุญาต (ค่าเริ่มต้นของ CLIENT_ORIGIN)
export const ORIGIN = 'http://localhost:5173'
export const PASSWORD = 'password1234'

interface SendOptions {
  body?: unknown
  cookie?: string
}

// ส่ง request แบบเดียวกับที่ browser ส่ง: มี header Origin และแนบ cookie ถ้ามี
export function send(method: string, path: string, options: SendOptions = {}) {
  const headers: Record<string, string> = { Origin: ORIGIN }
  if (options.cookie) headers.Cookie = options.cookie
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  return app.request(path, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
}

// ดึงค่า cookie token จาก header Set-Cookie ของ response เพื่อใช้กับ request ถัดไป
export function tokenCookie(res: Response): string {
  const setCookie = res.headers.get('Set-Cookie') ?? ''
  return setCookie.split(';')[0] ?? ''
}

let counter = 0

// สร้างผู้ใช้ตามบทบาทที่ต้องการ แล้ว login ได้ cookie กลับมา
export async function loginAs(role: Role) {
  const email = `${role}${++counter}@example.com`
  const user = await new UserService(db).create({
    email,
    name: role,
    lastname: 'test',
    password: PASSWORD,
    role,
  })
  const res = await send('POST', '/api/auth/login', { body: { email, password: PASSWORD } })
  return { user, cookie: tokenCookie(res) }
}
