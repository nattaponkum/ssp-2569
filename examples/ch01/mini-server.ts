import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

// เซิร์ฟเวอร์ขนาดเล็กด้วยโมดูล node:http ที่มากับ Node.js
const server = createServer((req, res) => {
  console.log(`[server] ${req.method} ${req.url}`)

  if (req.method === 'GET' && req.url === '/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Hello from node:http' }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
})

// พอร์ต 0 = ให้ระบบปฏิบัติการเลือกพอร์ตที่ว่างให้
server.listen(0, async () => {
  const { port } = server.address() as AddressInfo
  const baseUrl = `http://localhost:${port}`
  console.log(`[server] listening on ${baseUrl}`)

  // ฝั่งไคลเอนต์: เรียกเซิร์ฟเวอร์ด้วย fetch
  const ok = await fetch(new URL('/hello', baseUrl))
  console.log('[client] status:', ok.status)
  console.log('[client] content-type:', ok.headers.get('content-type'))
  console.log('[client] body:', await ok.json())

  const notFound = await fetch(new URL('/coffees', baseUrl))
  console.log('[client] status:', notFound.status)
  console.log('[client] body:', await notFound.json())

  // ปิดเซิร์ฟเวอร์เพื่อให้สคริปต์จบเอง
  server.close(() => console.log('[server] closed'))
})
