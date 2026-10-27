import { beforeEach, describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { authApi } from '@/api/auth'
import { useAuthStore } from '../auth'

// แทนการเรียกเว็บเซอร์วิสจริงด้วยฟังก์ชันจำลอง
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn<typeof authApi.login>(),
    logout: vi.fn<typeof authApi.logout>(),
    me: vi.fn<typeof authApi.me>(),
    register: vi.fn<typeof authApi.register>(),
  },
}))

const admin = {
  id: 1,
  email: 'admin@example.com',
  name: 'ผู้ดูแล',
  lastname: 'ระบบ',
  role: 'admin' as const,
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login เก็บข้อมูลผู้ใช้ และ isLoggedIn/isAdmin เป็น true', async () => {
    vi.mocked(authApi.login).mockResolvedValue(admin)
    const auth = useAuthStore()
    await auth.login({ email: admin.email, password: 'password1234' })
    expect(auth.user).toEqual(admin)
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.isAdmin).toBe(true)
  })

  it('logout ล้างข้อมูลผู้ใช้', async () => {
    vi.mocked(authApi.login).mockResolvedValue(admin)
    const auth = useAuthStore()
    await auth.login({ email: admin.email, password: 'password1234' })
    await auth.logout()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('fetchMe เมื่อไม่ได้ login (server ตอบ 401) ได้ user เป็น null', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error('กรุณาเข้าสู่ระบบ'))
    const auth = useAuthStore()
    await auth.fetchMe()
    expect(auth.user).toBeNull()
  })
})
