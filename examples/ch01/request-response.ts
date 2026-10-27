// Request และ Response เป็นวัตถุมาตรฐานของเว็บ (Fetch API)
// ใช้ได้เหมือนกันทั้งในเบราว์เซอร์, Node.js 18 ขึ้นไป และ Hono

// 1) สร้าง Request แบบเดียวกับที่ไคลเอนต์ส่งไปหาเซิร์ฟเวอร์
const req = new Request('http://localhost:8081/coffee?size=large', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer demo-token',
  },
  body: JSON.stringify({ name: 'Latte', price: 65 }),
})

const url = new URL(req.url)
console.log('--- Request ---')
console.log('method:', req.method)
console.log('url:', req.url)
console.log('pathname:', url.pathname)
console.log('query size:', url.searchParams.get('size'))
console.log('content-type:', req.headers.get('content-type'))
console.log('authorization:', req.headers.get('authorization'))

const input = (await req.json()) as { name: string, price: number }
console.log('body:', input)

// 2) สร้าง Response แบบเดียวกับที่เซิร์ฟเวอร์ตอบกลับ
const res = Response.json({ id: 1, ...input }, { status: 201 })

console.log('--- Response ---')
console.log('status:', res.status)
console.log('ok:', res.ok)
console.log('content-type:', res.headers.get('content-type'))
console.log('body:', await res.json())
