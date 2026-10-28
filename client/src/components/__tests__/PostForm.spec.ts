import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import PostForm from '../PostForm.vue'

// แทน RichTextEditor (TipTap) ด้วย textarea ธรรมดาที่รองรับ v-model แบบเดียวกัน
const EditorStub = defineComponent({
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('textarea', {
        value: props.modelValue,
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value),
      })
  },
})

function mountForm() {
  return mount(PostForm, {
    props: { post: null },
    global: { stubs: { RichTextEditor: EditorStub } },
  })
}

describe('PostForm', () => {
  it('ไม่กรอกชื่อเรื่อง: แสดง error และไม่ส่ง submit', async () => {
    const wrapper = mountForm()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('.error').exists()).toBe(true)
  })

  it('เนื้อหามีแต่ <p></p> จาก editor ว่าง: แสดง error และไม่ส่ง submit', async () => {
    const wrapper = mountForm()
    const inputs = wrapper.findAll('input:not([type=file])')
    await inputs[0]!.setValue('เรื่องใหม่')
    await inputs[1]!.setValue('บทเรียน')
    await wrapper.find('textarea').setValue('<p></p>')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('กรุณาใส่เนื้อหาบทความ')
  })

  it('กรอกครบ: ส่งข้อมูลพร้อมสถานะเริ่มต้นเป็น draft', async () => {
    const wrapper = mountForm()
    const inputs = wrapper.findAll('input:not([type=file])')
    await inputs[0]!.setValue('เรื่องใหม่')
    await inputs[1]!.setValue('บทเรียน')
    await wrapper.find('textarea').setValue('<p>เนื้อหา</p>')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          title: 'เรื่องใหม่',
          category: 'บทเรียน',
          status: 'draft',
          content: '<p>เนื้อหา</p>',
          thumbnail: null,
        },
      ],
    ])
  })
})
