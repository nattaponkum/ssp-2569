// ฟังก์ชันกลางสำหรับ "เรียกใช้" เว็บเซอร์วิส ทุกไฟล์ใน src/api/ ใช้ฟังก์ชันนี้

// ที่อยู่ของ server อ่านจากไฟล์ .env ของ Vite ถ้าไม่ได้ตั้งไว้:
// - ตอนพัฒนา (npm run dev) ใช้ server บนเครื่อง http://localhost:8081
// - ตอน build ไปใช้งานจริง ใช้ '' คือเรียก /api บน origin เดียวกับหน้าเว็บ
//   (Hono เสิร์ฟทั้งหน้าเว็บและ API)
const DEFAULT_API_URL = import.meta.env.DEV ? 'http://localhost:8081' : ''
export const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

// error ที่มี status code และข้อความจาก server ({ error, issues })
export class ApiError extends Error {
  status: number
  issues: unknown[]

  constructor(status: number, message: string, issues: unknown[] = []) {
    super(message)
    this.status = status
    this.issues = issues
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

// เตรียม body: FormData (อัปโหลดไฟล์) ส่งไปตรง ๆ ให้ browser ตั้ง Content-Type แบบ multipart เอง
// ข้อมูลอื่นแปลงเป็น JSON
function toRequestBody(body: unknown): { body?: BodyInit; headers: Record<string, string> } {
  if (body === undefined) return { headers: {} }
  if (body instanceof FormData) return { body, headers: {} }
  return { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
}

// เรียก fetch และแปลงกรณีติดต่อ server ไม่ได้เลย (server ปิดอยู่ เน็ตหลุด CORS ผิด)
// ซึ่ง fetch โยน TypeError "Failed to fetch" ให้เป็นข้อความภาษาไทยที่ผู้ใช้เข้าใจ
async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new ApiError(0, 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่')
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await send(`${API_URL}/api${path}`, {
    method: options.method ?? 'GET',
    // ให้ browser แนบ cookie ไปด้วยแม้ client กับ server อยู่คนละ origin
    credentials: 'include',
    ...toRequestBody(options.body),
  })

  if (!res.ok) {
    // server ตอบ error เป็น { error: 'ข้อความ' } เสมอ ถ้าอ่านไม่ได้ให้ใช้ข้อความมาตรฐานของ HTTP
    const data = await res.json().catch(() => ({}))
    throw new ApiError(res.status, data.error ?? res.statusText, data.issues)
  }

  // 204 No Content ไม่มี body ให้อ่าน
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
