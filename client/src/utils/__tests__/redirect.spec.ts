import { describe, it, expect } from 'vitest'
import { safeRedirect } from '../redirect'

describe('safeRedirect', () => {
  it('รับ path ภายในเว็บ', () => {
    expect(safeRedirect('/admin/posts?x=1', '/admin')).toBe('/admin/posts?x=1')
  })

  it('ไม่รับ URL ของเว็บอื่น แล้วใช้ค่าสำรองแทน', () => {
    expect(safeRedirect('https://evil.example', '/admin')).toBe('/admin')
    expect(safeRedirect('//evil.example', '/admin')).toBe('/admin')
    expect(safeRedirect('/\\evil.example', '/admin')).toBe('/admin')
    expect(safeRedirect(undefined, '/admin')).toBe('/admin')
    expect(safeRedirect(['/a', '/b'], '/admin')).toBe('/admin')
  })
})
