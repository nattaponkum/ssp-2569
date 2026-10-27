import { beforeEach, describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore } from '../ui'

describe('ui store', () => {
  beforeEach(() => {
    // สร้าง Pinia ใหม่ทุก test เพื่อไม่ให้ state ค้างข้าม test
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('notify แสดงข้อความ แล้วล้างเองเมื่อครบเวลา', () => {
    const ui = useUiStore()
    ui.notify('บันทึกแล้ว', 1000)
    expect(ui.notice).toBe('บันทึกแล้ว')
    vi.advanceTimersByTime(1000)
    expect(ui.notice).toBe('')
  })
})
