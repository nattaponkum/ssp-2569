const menu = ['Espresso', 'Latte', 'Mocha', 'Americano']

// 1) for แบบนับรอบ: ใช้เมื่อต้องการ index หรือควบคุมการนับเอง
for (let i = 0; i < menu.length; i++) {
  console.log(`${i + 1}. ${menu[i]}`)
}

// 2) for...of: วนอ่านสมาชิกทีละตัว อ่านง่ายที่สุด
for (const name of menu) {
  console.log('for...of:', name)
}

// ต้องการทั้ง index และค่า ใช้ entries() คู่กับ for...of
for (const [index, name] of menu.entries()) {
  console.log('entries:', index, name)
}

// 3) forEach: ส่งฟังก์ชันให้ทำงานกับสมาชิกทุกตัว (ใช้ break ไม่ได้)
menu.forEach((name, index) => {
  console.log(`forEach: [${index}] ${name}`)
})

// 4) while: วนจนกว่าเงื่อนไขจะเป็นเท็จ เหมาะเมื่อไม่รู้จำนวนรอบล่วงหน้า
let stock = 3
while (stock > 0) {
  console.log('ขายได้ 1 แก้ว เหลือ', stock - 1)
  stock--
}

// continue ข้ามรอบนี้ / break ออกจากการวนซ้ำทันที
for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  if (n % 2 === 0) continue // ข้ามเลขคู่
  if (n > 7) break // เกิน 7 แล้วเลิกวน
  console.log('เลขคี่:', n)
}
