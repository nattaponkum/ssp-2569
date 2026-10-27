import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserTable from '../UserTable.vue'

const users = [
  { id: 1, email: 'somchai@example.com', name: 'สมชาย', lastname: 'ใจดี' },
  { id: 2, email: 'somsri@example.com', name: 'สมศรี', lastname: 'รักเรียน' },
]

describe('UserTable', () => {
  it('แสดงผู้ใช้หนึ่งแถวต่อหนึ่งคน', () => {
    const wrapper = mount(UserTable, { props: { users } })
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('somsri@example.com')
  })

  it('กดปุ่มลบแล้วส่ง event delete พร้อม id', async () => {
    const wrapper = mount(UserTable, { props: { users } })
    await wrapper.findAll('button.danger')[1]!.trigger('click')
    expect(wrapper.emitted('delete')).toEqual([[2]])
  })

  it('แสดงข้อความเมื่อไม่มีผู้ใช้', () => {
    const wrapper = mount(UserTable, { props: { users: [] } })
    expect(wrapper.text()).toContain('ยังไม่มีผู้ใช้')
  })
})
