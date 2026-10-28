import { beforeEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/api/client'
import { usersApi } from '@/api/users'
import UsersView from '../UsersView.vue'

vi.mock('@/api/users', () => ({
  usersApi: {
    list: vi.fn<typeof usersApi.list>(),
    create: vi.fn<typeof usersApi.create>(),
    update: vi.fn<typeof usersApi.update>(),
    remove: vi.fn<typeof usersApi.remove>(),
  },
}))

const somchai = {
  id: 1,
  email: 'somchai@example.com',
  name: 'สมชาย',
  lastname: 'ใจดี',
  role: 'user' as const,
}

describe('UsersView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('เพิ่มผู้ใช้สำเร็จแล้วฟอร์มถูกล้าง', async () => {
    vi.mocked(usersApi.list).mockResolvedValue([])
    vi.mocked(usersApi.create).mockResolvedValue(somchai)
    const wrapper = mount(UsersView)
    await flushPromises()

    const inputs = wrapper.findAll('form input')
    await inputs[0]!.setValue(somchai.email)
    await inputs[1]!.setValue(somchai.name)
    await inputs[2]!.setValue(somchai.lastname)
    await inputs[3]!.setValue('password1234')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(usersApi.create).toHaveBeenCalledOnce()
    const inputsAfter = wrapper.findAll<HTMLInputElement>('form input')
    expect(inputsAfter.map((input) => input.element.value)).toEqual(['', '', '', ''])
  })

  it('โหลดไม่สำเร็จ: แสดง error และไม่แสดงตาราง (ไม่มีแถว "ยังไม่มีผู้ใช้" ปนมา)', async () => {
    vi.mocked(usersApi.list).mockRejectedValue(new ApiError(0, 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'))
    const wrapper = mount(UsersView)
    await flushPromises()

    expect(wrapper.text()).toContain('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
    expect(wrapper.find('table').exists()).toBe(false)
  })
})
