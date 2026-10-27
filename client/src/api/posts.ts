import type { Post, PostCreate, PostPage, PostQuery, PostSummary, PostUpdate } from '@ssp/shared'
import { api } from './client'

// แปลง { search: 'vue', cursor: 12 } เป็น "?search=vue&cursor=12" (ข้ามค่าว่าง)
function toQueryString(query: PostQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

// เรียกเว็บเซอร์วิสบทความ: ส่วนสาธารณะ (/posts) และส่วนจัดการ (/admin/posts)
export const postsApi = {
  list: (query: PostQuery = {}) => api<PostPage>(`/posts${toQueryString(query)}`),
  categories: () => api<string[]>('/categories'),
  get: (id: number) => api<Post>(`/posts/${id}`),
  adminList: () => api<PostSummary[]>('/admin/posts'),
  adminGet: (id: number) => api<Post>(`/admin/posts/${id}`),
  create: (data: PostCreate) => api<Post>('/posts', { method: 'POST', body: data }),
  update: (id: number, data: PostUpdate) =>
    api<Post>(`/posts/${id}`, { method: 'PATCH', body: data }),
  remove: (id: number) => api<void>(`/posts/${id}`, { method: 'DELETE' }),
}
