import type { LoginInput, RegisterInput, User } from '@ssp/shared'
import { api } from './client'

// เรียกเว็บเซอร์วิส /api/auth (token อยู่ใน cookie httpOnly ฝั่ง client จึงไม่ต้องจัดการ token เอง)
export const authApi = {
  login: (data: LoginInput) => api<User>('/auth/login', { method: 'POST', body: data }),
  register: (data: RegisterInput) => api<User>('/auth/register', { method: 'POST', body: data }),
  logout: () => api<void>('/auth/logout', { method: 'POST' }),
  me: () => api<User>('/auth/me'),
}
