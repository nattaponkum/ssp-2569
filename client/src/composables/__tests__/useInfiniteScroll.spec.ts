import { afterEach, describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { useInfiniteScroll } from '../useInfiniteScroll'

// jsdom ไม่มี IntersectionObserver จึงเขียนตัวจำลองที่เราสั่งให้ "มองเห็น" เองได้
let callback: IntersectionObserverCallback
const observe = vi.fn<() => void>()
const unobserve = vi.fn<() => void>()
const disconnect = vi.fn<() => void>()
class FakeObserver {
  constructor(cb: IntersectionObserverCallback) {
    callback = cb
  }
  observe = observe
  unobserve = unobserve
  disconnect = disconnect
}

function becomeVisible() {
  callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
}

// component ทดสอบที่มีแค่ตัวเฝ้า
function mountWith(loadMore: () => Promise<boolean>) {
  return mount(
    defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        useInfiniteScroll(target, loadMore)
        return () => h('div', { ref: target })
      },
    }),
  )
}

describe('useInfiniteScroll', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('เรียก loadMore เมื่อมองเห็นตัวเฝ้า', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const loadMore = vi.fn<() => Promise<boolean>>().mockResolvedValue(false)
    mountWith(loadMore)

    becomeVisible()
    await flushPromises()
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('ไม่เรียกซ้ำระหว่างที่หน้าก่อนยังโหลดไม่เสร็จ', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const loadMore = vi.fn<() => Promise<boolean>>(() => new Promise(() => {}))
    mountWith(loadMore)

    becomeVisible()
    becomeVisible()
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('ถ้ายังมีข้อมูลอีก (loadMore คืน true) สั่ง observe ใหม่เพื่อตรวจซ้ำ', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    mountWith(() => Promise.resolve(true))

    becomeVisible()
    await flushPromises()
    expect(unobserve).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledTimes(2)
  })

  it('ปิด observer เมื่อ component ถูกทำลาย', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const wrapper = mountWith(() => Promise.resolve(false))
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
