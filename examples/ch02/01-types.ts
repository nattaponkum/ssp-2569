// ชนิดข้อมูลพื้นฐาน (primitive types)
const course: string = 'Server Side Programming'
const credit: number = 3
const price = 65.5 // ไม่ได้ระบุชนิด แต่ TypeScript อนุมาน (infer) ว่าเป็น number
const isOpen: boolean = true
const nickname: string | null = null // ตั้งใจบอกว่า "ไม่มีค่า"
let address: string | undefined // ประกาศไว้แต่ยังไม่กำหนดค่า
const bigId: bigint = 9007199254740993n // ตัวเลขจำนวนเต็มที่ใหญ่มาก

console.log(typeof course, typeof credit, typeof price, typeof isOpen)
console.log(typeof nickname, typeof address, typeof bigId)
console.log('Number.MAX_SAFE_INTEGER =', Number.MAX_SAFE_INTEGER)
console.log('bigId =', bigId)

address = 'Phitsanulok'
console.log(address.toUpperCase())

// template literal ใช้ backtick และ ${...} แทรกค่าลงในข้อความ
console.log(`${course} มี ${credit} หน่วยกิต ราคากาแฟ ${price} บาท`)

// const ห้ามกำหนดค่าใหม่ ส่วน let กำหนดค่าใหม่ได้
let count = 0
count = count + 1
console.log('count =', count)
