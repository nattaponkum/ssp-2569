import { describe, it, expect } from 'vitest'
import { htmlToText, sanitizePostHtml } from '../lib/html.ts'

describe('sanitizePostHtml', () => {
  it('คงแท็กที่ editor ใช้ไว้', () => {
    const html = '<h2>หัวข้อ</h2><p><strong>หนา</strong> <em>เอียง</em></p><ul><li>ข้อ</li></ul>'
    expect(sanitizePostHtml(html)).toBe(html)
  })

  it('ตัด script, event handler และลิงก์ javascript: ทิ้ง', () => {
    const dirty =
      '<p onclick="alert(1)">ข้อความ</p><script>alert(1)</script>' +
      '<a href="javascript:alert(1)">คลิก</a><img src="x" onerror="alert(1)">'
    const clean = sanitizePostHtml(dirty)
    expect(clean).not.toMatch(/script|onclick|onerror|javascript:/)
    expect(clean).toContain('<p>ข้อความ</p>')
  })

  it('รูปใช้ได้เฉพาะไฟล์ในเว็บเรา (/uploads/...) หรือ https', () => {
    expect(sanitizePostHtml('<img src="/uploads/a.png">')).toBe('<img src="/uploads/a.png" />')
    expect(sanitizePostHtml('<img src="data:image/png;base64,AAAA">')).toBe('<img />')
  })

  it('ลิงก์เปิดแท็บใหม่พร้อม rel="noopener noreferrer"', () => {
    expect(sanitizePostHtml('<a href="https://hono.dev">Hono</a>')).toBe(
      '<a href="https://hono.dev" target="_blank" rel="noopener noreferrer">Hono</a>',
    )
  })
})

describe('htmlToText', () => {
  it('ตัดแท็กออก เว้นวรรคระหว่างย่อหน้า และแปลง &amp; กลับ', () => {
    expect(htmlToText('<p>หนึ่ง</p><p>สอง &amp; สาม</p>')).toBe('หนึ่ง สอง & สาม')
  })
})
