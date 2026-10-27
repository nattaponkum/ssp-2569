interface User {
  id: number
  email: string
  name: string
  lastname: string
}

// ข้อมูลที่ใช้สร้างผู้ใช้ใหม่ = User ที่ไม่มี id (ระบบเป็นคนกำหนด id)
type NewUser = Omit<User, 'id'>

// interface กำหนด "สัญญา" ว่าคลาสที่ implements ต้องมีเมธอดอะไรบ้าง
interface UserStore {
  add(input: NewUser): User
  findAll(): User[]
  findById(id: number): User | undefined
  remove(id: number): boolean
}

class UserRepository implements UserStore {
  // #private field: เข้าถึงได้เฉพาะภายในคลาสเท่านั้น
  #users: User[] = []
  #nextId = 1

  add(input: NewUser): User {
    const user: User = { id: this.#nextId, ...input }
    this.#nextId++
    this.#users.push(user)
    return user
  }

  findAll(): User[] {
    return [...this.#users] // คืนสำเนา ป้องกันคนนอกแก้ไขตัวแปรชุดภายใน
  }

  findById(id: number): User | undefined {
    return this.#users.find((u) => u.id === id)
  }

  remove(id: number): boolean {
    const index = this.#users.findIndex((u) => u.id === id)
    if (index === -1) return false
    this.#users.splice(index, 1)
    return true
  }

  // getter: เรียกใช้เหมือน property (ไม่ต้องมีวงเล็บ)
  get count(): number {
    return this.#users.length
  }

  // static: เป็นของคลาส ไม่ใช่ของออบเจกต์แต่ละตัว
  static withSampleData(): UserRepository {
    const repo = new UserRepository()
    repo.add({ email: 'nattapon@example.com', name: 'Nattapon', lastname: 'Kumyaito' })
    repo.add({ email: 'steve.jobs@example.com', name: 'Steve', lastname: 'Jobs' })
    return repo
  }
}

const repo = UserRepository.withSampleData()
const ada = repo.add({ email: 'ada@example.com', name: 'Ada', lastname: 'Lovelace' })
console.log('เพิ่ม:', ada)
console.log('จำนวน:', repo.count)
console.log('findById(2):', repo.findById(2)?.email)
console.log('remove(1):', repo.remove(1), '| remove(1) อีกครั้ง:', repo.remove(1))
console.log('ที่เหลือ:', repo.findAll().map((u) => u.name))

const copy = repo.findAll()
copy.length = 0 // ล้างสำเนา ไม่กระทบข้อมูลใน repo
console.log('หลังล้างสำเนา repo ยังมี', repo.count, 'คน')

// การสืบทอด (inheritance) ด้วย extends และ super
class Person {
  name: string

  constructor(name: string) {
    this.name = name
  }

  introduce(): string {
    return `ผมชื่อ ${this.name}`
  }
}

class Author extends Person {
  penName: string
  #posts: string[] = []

  constructor(name: string, penName: string) {
    super(name) // เรียก constructor ของคลาสแม่ก่อนใช้ this
    this.penName = penName
  }

  write(title: string): void {
    this.#posts.push(title)
  }

  introduce(): string {
    return `${super.introduce()} นามปากกา ${this.penName} เขียนบทความไปแล้ว ${this.#posts.length} เรื่อง`
  }
}

const people: Person[] = [new Person('Steve'), new Author('Ada', 'Countess')]
const writer = people[1]
if (writer instanceof Author) {
  writer.write('Hello TypeScript')
  writer.write('Node.js 24')
}
for (const p of people) {
  console.log(p.introduce())
}
