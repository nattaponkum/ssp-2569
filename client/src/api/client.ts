// ฟังก์ชันกลางสำหรับ "เรียกใช้" เว็บเซอร์วิส ทุกไฟล์ใน src/api/ ใช้ฟังก์ชันนี้

// ที่อยู่ของ server อ่านจากไฟล์ .env ของ Vite (ถ้าไม่ได้ตั้งไว้ใช้ค่าของเครื่องนักพัฒนา)
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'

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

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
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
