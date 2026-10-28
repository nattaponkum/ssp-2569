// ตรวจค่า ?redirect= ก่อนพาผู้ใช้ไปต่อ รับเฉพาะ path ภายในเว็บเรา
// กันการถูกพาไปเว็บอื่น (open redirect)
// - ต้องขึ้นต้นด้วย / (path ในเว็บเดียวกัน)
// - ห้ามขึ้นต้นด้วย // เพราะ browser ตีความเป็นโดเมนอื่น เช่น //evil.example
// - ห้ามมี \ เพราะ browser แปลง \ เป็น / ทำให้ /\evil.example กลายเป็น //evil.example
export function safeRedirect(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  return value
}
