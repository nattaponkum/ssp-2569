// ระบุชนิดของพารามิเตอร์และค่าที่คืน (return type)
function add(a: number, b: number): number {
  return a + b
}

// พารามิเตอร์ที่มีค่าเริ่มต้น (default) และพารามิเตอร์ที่ไม่บังคับ (optional ?)
function greet(name: string, greeting = 'สวัสดี'): string {
  return `${greeting} ${name}`
}

function fullName(name: string, lastname?: string): string {
  return lastname === undefined ? name : `${name} ${lastname}`
}

// arrow function
const square = (n: number): number => n * n
const double = (n: number) => n * 2 // return type อนุมานเป็น number

// rest parameter รับค่าได้ไม่จำกัดจำนวน แล้วรวมเป็นตัวแปรชุด
function sum(...nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0)
}

// void: ฟังก์ชันที่ไม่คืนค่า
function log(message: string): void {
  console.log(`[log] ${message}`)
}

// function type: กำหนด "รูปร่าง" ของฟังก์ชัน แล้วส่งฟังก์ชันเป็นค่าได้
type Operation = (a: number, b: number) => number

const multiply: Operation = (a, b) => a * b

function calculate(a: number, b: number, op: Operation): number {
  return op(a, b)
}

// generic: T คือชนิดที่ผู้เรียกใช้เป็นคนกำหนด
function firstItem<T>(items: T[]): T | undefined {
  return items[0]
}

console.log(add(2, 3))
console.log(greet('Steve'), '|', greet('Steve', 'Hello'))
console.log(fullName('Steve'), '|', fullName('Steve', 'Jobs'))
console.log(square(4), double(4), sum(1, 2, 3, 4))
log('บันทึกข้อความ')
console.log(calculate(6, 7, multiply), calculate(6, 7, add))

const n = firstItem([10, 20, 30]) // n: number | undefined
const s = firstItem(['hot', 'iced']) // s: string | undefined
const none = firstItem<string>([]) // none: string | undefined
console.log(n, s, none)
