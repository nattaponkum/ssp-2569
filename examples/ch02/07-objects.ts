// object type เขียนตรง ๆ ได้ แต่ถ้าใช้ซ้ำควรตั้งชื่อด้วย interface หรือ type
const coffee: { name: string, price: number } = { name: 'Latte', price: 65 }
console.log(coffee.name, coffee.price)

interface User {
  readonly id: number // อ่านได้อย่างเดียว กำหนดค่าใหม่ไม่ได้
  email: string
  name: string
  lastname: string
  phone?: string // optional: จะมีหรือไม่มีก็ได้
}

// interface ขยาย (extends) จาก interface อื่นได้
type Role = 'admin' | 'author' | 'reader'

interface Author extends User {
  role: Role
  penName: string
}

// type alias ทำสิ่งคล้ายกันด้วย intersection (&)
type UserWithRole = User & { role: Role }

const steve: User = {
  id: 2,
  email: 'steve.jobs@example.com',
  name: 'Steve',
  lastname: 'Jobs',
}

const author: Author = {
  id: 3,
  email: 'ada@example.com',
  name: 'Ada',
  lastname: 'Lovelace',
  role: 'author',
  penName: 'Countess',
}

const admin: UserWithRole = { ...steve, role: 'admin' } // spread คัดลอก property แล้วเพิ่ม role

steve.name = 'Steven' // property ทั่วไปแก้ไขได้
console.log(steve)
console.log(author.penName, author.role)
console.log(admin.role, admin.name)

// property ที่เป็น optional ต้องตรวจก่อนใช้
console.log(steve.phone ?? '(ไม่มีเบอร์โทร)')
console.log(steve.phone?.length)

// destructuring: ดึง property ออกมาเป็นตัวแปร
const { name, email } = author
console.log(name, email)
