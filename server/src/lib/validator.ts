import type { ValidationTargets } from 'hono'
import { zValidator as honoZodValidator } from '@hono/zod-validator'
import type { ZodType } from 'zod'

// ห่อ zValidator ให้ตอบ error รูปแบบเดียวกันทั้งระบบ:
// { "error": "Invalid input", "issues": [...] } พร้อม status 400
export function zValidator<T extends ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) {
  return honoZodValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Invalid input', issues: result.error.issues }, 400)
    }
  })
}
