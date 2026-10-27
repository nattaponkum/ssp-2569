import type { User } from './user.ts'

export function greetThai(user: User): string {
  return `สวัสดีครับ คุณ${user.name}`
}

export function greetEnglish(user: User): string {
  return `Hello, ${user.name} ${user.lastname}`
}
