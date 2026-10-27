import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '../UserForm.vue'

describe('UserForm', () => {
  it('ข้อมูลไม่ถูกต้อง: แสดง error และไม่ส่ง event submit', async () => {
    const wrapper = mount(UserForm, { props: { user: null } })
    await wrapper.find('input[type=email]').setValue('not-an-email')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('.error').length).toBeGreaterThan(0)
  })

  it('ข้อมูลถูกต้อง: ส่ง event submit พร้อมข้อมูลฟอร์ม', async () => {
    const wrapper = mount(UserForm, { props: { user: null } })
    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('somsri@example.com')
    await inputs[1]!.setValue('สมศรี')
    await inputs[2]!.setValue('รักเรียน')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ email: 'somsri@example.com', name: 'สมศรี', lastname: 'รักเรียน' }],
    ])
  })
})
