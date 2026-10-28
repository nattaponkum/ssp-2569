import { afterEach, describe, it, expect, vi } from 'vitest'
import { api, API_URL, ApiError } from '../client'

// แทน fetch จริงด้วยฟังก์ชันจำลอง จึงทดสอบได้โดยไม่ต้องเปิด server
function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('api()', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ส่ง JSON พร้อม credentials และคืนข้อมูลที่ server ตอบ', async () => {
    const fetchMock = mockFetch(201, { id: 1 })
    const result = await api<{ id: number }>('/users', { method: 'POST', body: { name: 'A' } })

    expect(result).toEqual({ id: 1 })
    const [url, init] = fetchMock.mock.calls[0]!
    // ใช้ API_URL ที่ตั้งค่าไว้จริง (อาจถูกเปลี่ยนด้วย VITE_API_URL ในไฟล์ .env.local)
    expect(url).toBe(`${API_URL}/api/users`)
    expect(init).toMatchObject({ method: 'POST', credentials: 'include', body: '{"name":"A"}' })
  })

  it('แปลง error ของ server เป็น ApiError ที่มี status และข้อความ', async () => {
    mockFetch(409, { error: 'อีเมลนี้ถูกใช้แล้ว' })
    const error = await api('/users').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, message: 'อีเมลนี้ถูกใช้แล้ว' })
  })

  it('ติดต่อ server ไม่ได้ (fetch โยน TypeError) ได้ ApiError status 0', async () => {
    const failing = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', failing)
    const error = await api('/users').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0 })
    expect((error as ApiError).message).toContain('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
  })

  it('204 No Content คืน undefined', async () => {
    mockFetch(204)
    expect(await api('/users/1', { method: 'DELETE' })).toBeUndefined()
  })
})
