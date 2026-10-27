// ชนิดข้อมูลและคลาสที่เกี่ยวกับผู้ใช้
export interface User {
  id: number
  email: string
  name: string
  lastname: string
}

export type NewUser = Omit<User, 'id'>

export class UserRepository {
  #users: User[] = []
  #nextId = 1

  add(input: NewUser): User {
    const user: User = { id: this.#nextId, ...input }
    this.#nextId++
    this.#users.push(user)
    return user
  }

  findAll(): User[] {
    return [...this.#users]
  }
}
