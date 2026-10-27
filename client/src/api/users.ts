import type { User, UserCreate, UserUpdate } from '@ssp/shared'
import { api } from './client'

// ฟังก์ชันเรียกเว็บเซอร์วิส /api/users ชนิดข้อมูลมาจาก shared ชุดเดียวกับ server
export const usersApi = {
  list: () => api<User[]>('/users'),
  get: (id: number) => api<User>(`/users/${id}`),
  create: (data: UserCreate) => api<User>('/users', { method: 'POST', body: data }),
  update: (id: number, data: UserUpdate) =>
    api<User>(`/users/${id}`, { method: 'PATCH', body: data }),
  remove: (id: number) => api<void>(`/users/${id}`, { method: 'DELETE' }),
}
