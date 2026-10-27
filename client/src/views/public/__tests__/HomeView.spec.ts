import { afterEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { PostPage } from '@ssp/shared'
import { postsApi } from '@/api/posts'
import HomeView from '../HomeView.vue'

vi.mock('@/api/posts', () => ({
  postsApi: {
    list: vi.fn<typeof postsApi.list>(),
    categories: vi.fn<typeof postsApi.categories>(),
  },
}))

// IntersectionObserver จำลอง: ทุกครั้งที่ observe ให้รายงานว่า "มองเห็นตัวเฝ้า" (หน้ายังว่างอยู่)
class VisibleObserver {
  private callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe() {
    queueMicrotask(() =>
      this.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ),
    )
  }
  unobserve() {}
  disconnect() {}
}

const emptyPage: PostPage = { items: [], nextCursor: null }

describe('HomeView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('เปลี่ยนตัวกรองระหว่างที่คำขอเดิมยังไม่กลับ: ทิ้งผลเก่าแล้วโหลดของตัวกรองใหม่', async () => {
    vi.stubGlobal('IntersectionObserver', VisibleObserver)
    // คำขอแรกค้างไว้ก่อน จนกว่าเราจะสั่งให้ตอบ
    let answerFirst: (page: PostPage) => void = () => {}
    vi.mocked(postsApi.list)
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValue(emptyPage)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: HomeView }],
    })
    await router.push('/')
    mount(HomeView, {
      global: { plugins: [router], stubs: { CategoryMenu: true, PostCard: true } },
    })
    await flushPromises()
    expect(postsApi.list).toHaveBeenCalledTimes(1)

    // ผู้ใช้เลือกหมวดหมู่ใหม่ ขณะที่คำขอแรกยังไม่กลับ แล้วคำขอแรกจึงตอบกลับมา (ผลเก่า)
    await router.push('/?category=บทเรียน')
    answerFirst(emptyPage)
    await flushPromises()

    expect(postsApi.list).toHaveBeenCalledTimes(2)
    expect(vi.mocked(postsApi.list).mock.calls[1]![0]).toMatchObject({ category: 'บทเรียน' })
  })
})
