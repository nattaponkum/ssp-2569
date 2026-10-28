import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

// จำกัดจำนวนครั้งที่ "ทำไม่สำเร็จ" (เช่น login รหัสผ่านผิด) ต่อกุญแจหนึ่งค่าในช่วงเวลาที่กำหนด
// เพื่อชะลอการเดารหัสผ่านแบบ brute force โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม
//
// ข้อจำกัด: เก็บตัวนับไว้ในหน่วยความจำของ process นี้เท่านั้น ถ้ารัน server หลายตัว (หลาย instance)
// แต่ละตัวจะนับแยกกัน และตัวนับหายเมื่อรีสตาร์ต
// ระบบจริงที่มีหลาย instance ควรเก็บตัวนับไว้ในที่กลาง เช่น Redis

interface RateLimitOptions {
  // จำนวนครั้งที่ล้มเหลวได้สูงสุดในหนึ่งช่วงเวลา
  max: number
  // ความยาวของช่วงเวลา (มิลลิวินาที)
  windowMs: number
  // สร้างกุญแจสำหรับนับ เช่น IP + อีเมล
  key: (c: Context) => string | Promise<string>
  // response แบบใดนับว่าล้มเหลว
  isFailure: (res: Response) => boolean
  message: string
}

interface Attempt {
  count: number
  resetAt: number
}

export function failureRateLimit(options: RateLimitOptions) {
  const attempts = new Map<string, Attempt>()

  // ลบรายการที่หมดช่วงเวลาแล้ว ไม่ให้ Map โตไปเรื่อย ๆ
  function removeExpired(now: number) {
    for (const [key, attempt] of attempts) {
      if (attempt.resetAt <= now) attempts.delete(key)
    }
  }

  return createMiddleware(async (c, next) => {
    const now = Date.now()
    if (attempts.size > 1000) removeExpired(now)

    const key = await options.key(c)
    const attempt = attempts.get(key)
    if (attempt && attempt.resetAt > now && attempt.count >= options.max) {
      // บอก client ว่าต้องรออีกกี่วินาที (header มาตรฐานของ HTTP 429)
      c.header('Retry-After', String(Math.ceil((attempt.resetAt - now) / 1000)))
      return c.json({ error: options.message }, 429)
    }

    await next()

    if (options.isFailure(c.res)) {
      // เริ่มช่วงเวลาใหม่ถ้ายังไม่เคยผิด หรือช่วงเวลาเดิมหมดไปแล้ว
      const active = attempt && attempt.resetAt > now
      const current = active ? attempt : { count: 0, resetAt: now + options.windowMs }
      current.count++
      attempts.set(key, current)
    } else if (c.res.ok) {
      // ทำสำเร็จแล้ว ล้างตัวนับของกุญแจนี้
      attempts.delete(key)
    }
  })
}
