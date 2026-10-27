import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import type { PostSummary } from '@ssp/shared'
import PostCard from '../PostCard.vue'

const post: PostSummary = {
  id: 7,
  authorId: 1,
  authorName: 'ผู้ดูแล',
  title: 'ยินดีต้อนรับ',
  excerpt: 'บทความแรก',
  category: 'ข่าวสาร',
  status: 'published',
  thumbnail: null,
  createdAt: '2026-10-27T00:00:00.000Z',
  updatedAt: '2026-10-27T00:00:00.000Z',
}

describe('PostCard', () => {
  it('แสดงชื่อเรื่อง หมวดหมู่ ผู้เขียน และลิงก์ไปหน้าบทความ', () => {
    const wrapper = mount(PostCard, {
      props: { post },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.text()).toContain('ยินดีต้อนรับ')
    expect(wrapper.text()).toContain('ข่าวสาร')
    expect(wrapper.text()).toContain('ผู้ดูแล')
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
      name: 'post',
      params: { id: 7 },
    })
  })
})
