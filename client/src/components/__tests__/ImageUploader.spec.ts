import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { uploadsApi } from '@/api/uploads'
import ImageUploader from '../ImageUploader.vue'

vi.mock('@/api/uploads', () => ({
  uploadsApi: { upload: vi.fn<typeof uploadsApi.upload>() },
}))

// จำลองการเลือกไฟล์ใน <input type="file">
async function chooseFile(wrapper: ReturnType<typeof mount>, file: File) {
  const input = wrapper.find('input[type=file]')
  Object.defineProperty(input.element, 'files', { value: [file] })
  await input.trigger('change')
  await flushPromises()
}

describe('ImageUploader', () => {
  it('ไฟล์ใหญ่เกิน 2 MB: แจ้ง error และไม่อัปโหลด', async () => {
    const wrapper = mount(ImageUploader)
    await chooseFile(wrapper, new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'big.png'))
    expect(wrapper.text()).toContain('ไฟล์ใหญ่เกิน 2 MB')
    expect(uploadsApi.upload).not.toHaveBeenCalled()
  })

  it('อัปโหลดสำเร็จ: ส่ง event uploaded พร้อม url', async () => {
    vi.mocked(uploadsApi.upload).mockResolvedValue({ id: 1, url: '/uploads/a.png' })
    const wrapper = mount(ImageUploader)
    await chooseFile(wrapper, new File([new Uint8Array(10)], 'a.png'))
    expect(wrapper.emitted('uploaded')).toEqual([[{ id: 1, url: '/uploads/a.png' }]])
  })
})
