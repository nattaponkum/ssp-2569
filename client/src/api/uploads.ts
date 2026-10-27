import { api } from './client'

export interface UploadedImage {
  id: number
  url: string
}

// เรียกเว็บเซอร์วิส /api/uploads (ส่งไฟล์แบบ multipart/form-data ในฟิลด์ชื่อ file)
export const uploadsApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api<UploadedImage>('/uploads', { method: 'POST', body: form })
  },
  remove: (id: number) => api<void>(`/uploads/${id}`, { method: 'DELETE' }),
}
