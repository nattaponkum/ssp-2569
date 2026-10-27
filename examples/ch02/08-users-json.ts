interface User {
  id: number
  email: string
  name: string
  lastname: string
}

const users: User[] = [
  { id: 1, email: 'nattapon@example.com', name: 'Nattapon', lastname: 'Kumyaito' },
  { id: 2, email: 'steve.jobs@example.com', name: 'Steve', lastname: 'Jobs' },
]

function printUsers(list: User[]): void {
  for (const user of list) {
    console.log(`  #${user.id} ${user.name} ${user.lastname} <${user.email}>`)
  }
}

// เพิ่มผู้ใช้ด้วย push (id ใหม่ = id มากที่สุด + 1)
function addUser(email: string, name: string, lastname: string): User {
  const nextId = Math.max(0, ...users.map((u) => u.id)) + 1
  const user: User = { id: nextId, email, name, lastname }
  users.push(user)
  return user
}

// ค้นหาด้วย find (ไม่เจอได้ undefined)
function findUserById(id: number): User | undefined {
  return users.find((u) => u.id === id)
}

// ลบด้วย findIndex + splice (splice แก้ไขตัวแปรชุดเดิม)
function removeUser(id: number): boolean {
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return false
  users.splice(index, 1)
  return true
}

addUser('ada@example.com', 'Ada', 'Lovelace')
addUser('alan@example.com', 'Alan', 'Turing')
console.log('ผู้ใช้ทั้งหมด', users.length, 'คน')
printUsers(users)

const found = findUserById(2)
console.log('findUserById(2):', found?.name ?? 'ไม่พบ')
console.log('findUserById(9):', findUserById(9)?.name ?? 'ไม่พบ')

console.log('removeUser(1):', removeUser(1), '| removeUser(9):', removeUser(9))
printUsers(users)

// slice คัดลอก 2 คนแรกไปแสดง โดยไม่กระทบ users
console.log('2 คนแรก:', users.slice(0, 2).map((u) => u.name))

// JSON.stringify: object → ข้อความ JSON (string)
const json = JSON.stringify(users[0])
console.log('stringify:', json, '| typeof =', typeof json)
console.log(JSON.stringify({ id: 9, name: 'Steve' }, null, 2))

// JSON.parse: ข้อความ JSON → ค่า (TypeScript ให้ชนิดเป็น any) จึงควรรับเป็น unknown แล้วตรวจ
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'number' &&
    'email' in value && typeof value.email === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'lastname' in value && typeof value.lastname === 'string'
  )
}

const good: unknown = JSON.parse('{"id":5,"email":"grace@example.com","name":"Grace","lastname":"Hopper"}')
const bad: unknown = JSON.parse('{"id":"5","name":"Grace"}')

for (const value of [good, bad]) {
  if (isUser(value)) {
    console.log('ข้อมูลถูกต้อง:', value.email) // ตรงนี้ value เป็น User แล้ว
  } else {
    console.log('ข้อมูลไม่ถูกต้อง:', value)
  }
}
