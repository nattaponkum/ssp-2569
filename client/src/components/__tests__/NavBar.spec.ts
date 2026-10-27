import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import NavBar from '../NavBar.vue'

// ใช้ RouterLinkStub แทน RouterLink จริง จึงไม่ต้องสร้าง router ในการทดสอบนี้
function mountNavBar() {
  return mount(NavBar, { global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('NavBar', () => {
  it('ยังไม่ login: แสดงลิงก์เข้าสู่ระบบ', () => {
    setActivePinia(createPinia())
    const wrapper = mountNavBar()
    expect(wrapper.text()).toContain('เข้าสู่ระบบ')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('login แล้ว: แสดงชื่อผู้ใช้และปุ่มออกจากระบบ', () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.user = { id: 1, email: 'a@example.com', name: 'สมชาย', lastname: 'ใจดี', role: 'user' }
    const wrapper = mountNavBar()
    expect(wrapper.text()).toContain('สมชาย')
    expect(wrapper.find('button').text()).toBe('ออกจากระบบ')
  })
})
