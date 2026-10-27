// ข้อมูลผู้ใช้ที่ server เก็บและส่งกลับ
export interface User {
  id: number
  email: string
  name: string
  lastname: string
}

// ข้อมูลที่ใช้สร้างผู้ใช้ใหม่ (ยังไม่มี id เพราะ id ถูกกำหนดตอนบันทึก)
export type NewUser = Omit<User, 'id'>

// สัญญา (contract) ว่าที่เก็บข้อมูลผู้ใช้ต้องทำอะไรได้บ้าง
// route รู้จักแค่ interface นี้ จึงไม่สนว่าข้างในเก็บข้อมูลไว้ที่ใด
export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: number): Promise<User | undefined>
  create(data: NewUser): Promise<User>
  update(id: number, data: Partial<NewUser>): Promise<User | undefined>
  remove(id: number): Promise<boolean>
}

// เก็บผู้ใช้ไว้ใน array ในหน่วยความจำ (บทที่ 6 เปลี่ยนไส้ในเป็นฐานข้อมูล)
// ทุกเมธอดคืน Promise ตั้งแต่ตอนนี้ เพราะการอ่านฐานข้อมูลจริงเป็นงานแบบ asynchronous
export class UserService implements UserRepository {
  private users: User[] = []
  private nextId = 1

  constructor(initialUsers: NewUser[] = []) {
    for (const data of initialUsers) {
      this.users.push({ id: this.nextId++, ...data })
    }
  }

  async findAll(): Promise<User[]> {
    return this.users
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id)
  }

  async create(data: NewUser): Promise<User> {
    const user: User = { id: this.nextId++, ...data }
    this.users.push(user)
    return user
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const user = await this.findById(id)
    if (!user) return undefined
    // กำหนดทีละฟิลด์ เพื่อไม่ให้ค่าแปลกปลอม (เช่น id) ใน data ทับข้อมูลเดิม
    if (data.email) user.email = data.email
    if (data.name) user.name = data.name
    if (data.lastname) user.lastname = data.lastname
    return user
  }

  async remove(id: number): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id)
    if (index === -1) return false
    this.users.splice(index, 1)
    return true
  }
}
