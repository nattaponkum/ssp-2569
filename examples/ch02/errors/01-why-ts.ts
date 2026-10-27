// ตัวอย่างที่ตั้งใจให้ผิด: ส่ง string ให้พารามิเตอร์ที่ต้องเป็น number
function addShipping(price: number, shipping: number): number {
  return price + shipping
}

const user = { name: 'Steve', email: 'steve.jobs@example.com' }

console.log(addShipping(100, '50'))
console.log(user.emial)
