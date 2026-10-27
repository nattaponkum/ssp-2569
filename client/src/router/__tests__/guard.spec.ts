import { beforeEach, describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { authApi } from '@/api/auth'
import router from '../index'

vi.mock('@/api/auth', () => ({
  authApi: { me: vi.fn<typeof authApi.me>() },
}))

const user = {
  id: 2,
  email: 'somchai@example.com',
  name: 'สมชาย',
  lastname: 'ใจดี',
  role: 'user' as const,
}

describe('route guard', () => {
  beforeEach(async () => {
    // เริ่มทุก test ด้วย store ใหม่ (ยังไม่เคยถาม server) และอยู่ที่หน้าแรก
    setActivePinia(createPinia())
    vi.mocked(authApi.me).mockRejectedValue(new Error('กรุณาเข้าสู่ระบบ'))
    await router.push('/')
  })

  it('หน้าสาธารณะเข้าได้โดยไม่ต้อง login', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('ยังไม่ login เข้าหน้า admin ถูกส่งไปหน้า login พร้อม redirect', async () => {
    await router.push('/admin/users')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/users')
  })

  it('login เป็น user แต่หน้านั้นต้องเป็น admin ได้หน้า 403', async () => {
    setActivePinia(createPinia())
    vi.mocked(authApi.me).mockResolvedValue(user)
    await router.push('/admin/users')
    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('admin เข้าหน้าจัดการผู้ใช้ได้', async () => {
    setActivePinia(createPinia())
    vi.mocked(authApi.me).mockResolvedValue({ ...user, role: 'admin' })
    await router.push('/admin/users')
    expect(router.currentRoute.value.name).toBe('admin-users')
  })

  it('path ที่ไม่มีอยู่ได้หน้า 404', async () => {
    await router.push('/no-such-page')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
