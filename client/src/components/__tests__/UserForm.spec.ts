import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '../UserForm.vue'

describe('UserForm', () => {
  it('ข้อมูลไม่ถูกต้อง: แสดง error และไม่ส่ง event create', async () => {
    const wrapper = mount(UserForm, { props: { user: null } })
    await wrapper.find('input[type=email]').setValue('not-an-email')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('create')).toBeUndefined()
    expect(wrapper.findAll('.error').length).toBeGreaterThan(0)
  })

  it('สร้างใหม่: ข้อมูลถูกต้องส่ง event create พร้อมข้อมูลฟอร์ม', async () => {
    const wrapper = mount(UserForm, { props: { user: null } })
    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('somsri@example.com')
    await inputs[1]!.setValue('สมศรี')
    await inputs[2]!.setValue('รักเรียน')
    await inputs[3]!.setValue('password1234')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('create')).toEqual([
      [
        {
          email: 'somsri@example.com',
          name: 'สมศรี',
          lastname: 'รักเรียน',
          password: 'password1234',
          role: 'user',
        },
      ],
    ])
  })

  it('แก้ไข: เว้นรหัสผ่านว่างได้ และไม่ส่ง password ไป', async () => {
    const user = { id: 1, email: 'a@example.com', name: 'A', lastname: 'B', role: 'user' as const }
    const wrapper = mount(UserForm, { props: { user } })
    await wrapper.find('form').trigger('submit')

    const [data] = wrapper.emitted('update')![0]!
    expect(data).not.toHaveProperty('password')
  })
})
