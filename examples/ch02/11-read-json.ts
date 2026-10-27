import { readFile } from 'node:fs/promises'

interface User {
  id: number
  email: string
  name: string
  lastname: string
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'number' &&
    'email' in value && typeof value.email === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'lastname' in value && typeof value.lastname === 'string'
  )
}

// อ่านไฟล์ JSON แล้วตรวจว่าเป็นตัวแปรชุดของ User จริงหรือไม่
async function loadUsers(path: URL): Promise<User[]> {
  const text = await readFile(path, 'utf8') // อ่านไฟล์แบบไม่ขวางโปรแกรม
  const data: unknown = JSON.parse(text)
  if (!Array.isArray(data) || !data.every(isUser)) {
    throw new Error('รูปแบบข้อมูลใน users.json ไม่ถูกต้อง')
  }
  return data
}

// import.meta.url คือที่อยู่ของไฟล์นี้ ใช้หาไฟล์ data/users.json ที่อยู่ข้าง ๆ
const usersFile = new URL('./data/users.json', import.meta.url)
const users = await loadUsers(usersFile)
console.log(`อ่านได้ ${users.length} คน`)
for (const u of users) {
  console.log(`- ${u.name} ${u.lastname} (${u.email})`)
}

// กรณีไฟล์ไม่มีอยู่จริง
try {
  await loadUsers(new URL('./data/missing.json', import.meta.url))
} catch (error) {
  if (error instanceof Error) {
    console.log('อ่านไฟล์ไม่สำเร็จ:', error.message)
  }
}
