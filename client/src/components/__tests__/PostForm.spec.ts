import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PostForm from '../PostForm.vue'

describe('PostForm', () => {
  it('ไม่กรอกชื่อเรื่อง: แสดง error และไม่ส่ง submit', async () => {
    const wrapper = mount(PostForm, { props: { post: null } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('.error').exists()).toBe(true)
  })

  it('กรอกครบ: ส่งข้อมูลพร้อมสถานะเริ่มต้นเป็น draft', async () => {
    const wrapper = mount(PostForm, { props: { post: null } })
    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('เรื่องใหม่')
    await inputs[1]!.setValue('บทเรียน')
    await wrapper.find('textarea').setValue('เนื้อหา')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ title: 'เรื่องใหม่', category: 'บทเรียน', status: 'draft', content: 'เนื้อหา' }],
    ])
  })
})
