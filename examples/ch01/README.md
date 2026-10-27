# ตัวอย่างประกอบบทที่ 1 สถาปัตยกรรมเว็บไคลเอนต์-เซิร์ฟเวอร์

ต้องใช้ Node.js 24 LTS (24.15 ขึ้นไป) ซึ่งรันไฟล์ `.ts` ได้โดยตรง รันจากโฟลเดอร์รากของ repo

| ไฟล์ | สิ่งที่สาธิต |
|---|---|
| `request-response.ts` | สร้างและอ่านวัตถุ `Request` / `Response` มาตรฐานของเว็บ (Fetch API) |
| `mini-server.ts` | เว็บเซิร์ฟเวอร์ขนาดเล็กด้วย `node:http` ตอบ `GET /hello` เป็น JSON แล้วเรียกด้วย `fetch` ในไฟล์เดียวกัน จากนั้นปิดตัวเอง |

```bash
node examples/ch01/request-response.ts
node examples/ch01/mini-server.ts
```

`mini-server.ts` ใช้พอร์ต 0 ให้ระบบปฏิบัติการเลือกพอร์ตว่างให้ เลขพอร์ตที่พิมพ์ออกมาจึงเปลี่ยนไปทุกครั้งที่รัน

ตรวจชนิดข้อมูล: `npx tsc -p examples --noEmit`
