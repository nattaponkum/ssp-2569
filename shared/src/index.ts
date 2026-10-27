import { z } from 'zod'

// ให้ข้อความ error ของ Zod เป็นภาษาไทย (มีผลทั้ง server และ client ที่ import shared)
z.config(z.locales.th())

// schema และ type ที่ใช้ร่วมกันระหว่าง server และ client
export * from './user.ts'
export * from './auth.ts'
export * from './post.ts'
