// literal type, union type และ type alias
type CoffeeType = 'hot' | 'iced' | 'frappe'
type Id = number | string

let size: 'S' | 'M' | 'L' = 'M'
size = 'L'
console.log('size =', size)

// narrowing: ใช้ typeof แยกกรณีแล้ว TypeScript จะรู้ชนิดในแต่ละบล็อก
function formatId(id: Id): string {
  if (typeof id === 'number') {
    return id.toString().padStart(5, '0') // ในบล็อกนี้ id เป็น number
  }
  return id.toUpperCase() // เหลือกรณีเดียวคือ string
}

console.log(formatId(42))
console.log(formatId('u-7'))

function describe(type: CoffeeType): string {
  if (type === 'hot') return 'กาแฟร้อน'
  if (type === 'iced') return 'กาแฟเย็น'
  return 'กาแฟปั่น'
}

console.log(describe('iced'))

// any กับ unknown
const risky: any = JSON.parse('{"name":"Steve"}')
console.log('any:', risky.nmae) // พิมพ์ชื่อ property ผิด แต่ tsc ไม่เตือนเลย

const data: unknown = JSON.parse('{"name":"Steve"}')
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log('unknown:', data.name) // ตรวจแล้วจึงใช้ได้
}
