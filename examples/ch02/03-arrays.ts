// การประกาศตัวแปรชุด (Array)
const scores: number[] = [80, 75, 60]
const tags: Array<string> = ['typescript', 'node']
const campus: [number, number] = [16.74, 100.19] // tuple: [ละติจูด, ลองจิจูด]
const weekdays: readonly string[] = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.']

console.log('length =', scores.length, 'first =', scores[0], 'last =', scores.at(-1))
console.log('tags =', tags, 'campus =', campus, 'weekdays =', weekdays.length)

// push เพิ่มท้าย, pop ดึงตัวท้ายออก (ทั้งคู่แก้ไขตัวแปรชุดเดิม)
scores.push(95)
console.log('หลัง push:', scores)
const last = scores.pop()
console.log('pop ได้', last, 'เหลือ', scores)

// slice(start, end) คัดลอกช่วงข้อมูลออกมา ต้นฉบับไม่เปลี่ยน
const letters = ['A', 'B', 'C', 'D', 'E']
const picked = letters.slice(1, 3)
console.log('slice(1, 3)  =', picked)
console.log('letters      =', letters)

// splice(start, deleteCount) ตัดข้อมูลออกจากต้นฉบับจริง ๆ
const removed = letters.splice(1, 3)
console.log('splice(1, 3) =', removed)
console.log('letters      =', letters)

// splice แทรกข้อมูลได้ด้วย: เริ่มที่ index 1 ลบ 0 ตัว แล้วแทรก 'X', 'Y'
letters.splice(1, 0, 'X', 'Y')
console.log('insert       =', letters)
