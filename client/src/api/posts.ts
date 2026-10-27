import type { Post, PostCreate, PostSummary, PostUpdate } from '@ssp/shared'
import { api } from './client'

// เรียกเว็บเซอร์วิสบทความ: ส่วนสาธารณะ (/posts) และส่วนจัดการ (/admin/posts)
export const postsApi = {
  list: () => api<PostSummary[]>('/posts'),
  get: (id: number) => api<Post>(`/posts/${id}`),
  adminList: () => api<PostSummary[]>('/admin/posts'),
  adminGet: (id: number) => api<Post>(`/admin/posts/${id}`),
  create: (data: PostCreate) => api<Post>('/posts', { method: 'POST', body: data }),
  update: (id: number, data: PostUpdate) =>
    api<Post>(`/posts/${id}`, { method: 'PATCH', body: data }),
  remove: (id: number) => api<void>(`/posts/${id}`, { method: 'DELETE' }),
}
