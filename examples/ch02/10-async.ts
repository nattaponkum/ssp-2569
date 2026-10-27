interface User {
  id: number
  email: string
  name: string
  lastname: string
}

// ห่อ setTimeout ด้วย Promise เพื่อให้ใช้ await ได้
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// จำลองการดึงข้อมูลจากฐานข้อมูลที่ใช้เวลา 300 ms
async function fetchUser(id: number): Promise<User> {
  await sleep(300)
  if (id <= 0) {
    throw new Error(`ไม่พบผู้ใช้ id ${id}`)
  }
  return { id, email: `user${id}@example.com`, name: `User${id}`, lastname: 'Example' }
}

// 1) ลำดับการทำงาน: งานที่รอ (setTimeout) ไม่ขวางบรรทัดถัดไป
console.log('A: เริ่ม')
setTimeout(() => console.log('C: setTimeout ทำงาน (หลัง 0 ms)'), 0)
console.log('B: บรรทัดสุดท้ายของโค้ดส่วนนี้')
await sleep(10)

// 2) async/await: รอผลแบบอ่านง่ายเหมือนโค้ดทำงานทีละบรรทัด
const user = await fetchUser(1)
console.log('ได้ผู้ใช้:', user.email)

// 3) try/catch จัดการข้อผิดพลาดของ Promise ที่ถูก reject
try {
  await fetchUser(0)
} catch (error) {
  // error มีชนิดเป็น unknown ต้องตรวจก่อนใช้
  const message = error instanceof Error ? error.message : String(error)
  console.log('เกิดข้อผิดพลาด:', message)
}

// 4) รอทีละตัว vs Promise.all (เริ่มทุกงานพร้อมกัน)
let start = performance.now()
await fetchUser(1)
await fetchUser(2)
await fetchUser(3)
console.log(`รอทีละตัว: ประมาณ ${Math.round((performance.now() - start) / 100) * 100} ms`)

start = performance.now()
const all = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)])
console.log(`Promise.all: ประมาณ ${Math.round((performance.now() - start) / 100) * 100} ms`)
console.log(all.map((u) => u.name))
