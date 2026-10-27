# ssp-2569

โค้ดตัวอย่างประกอบหนังสือ **Server Side Programming (273372) ฉบับ 2569**
ภาคเรียนที่ 2 ปีการศึกษา 2569

| ส่วน | เทคโนโลยี |
|---|---|
| `server/` | [Hono](https://hono.dev) + TypeScript (บทที่ 6 เพิ่ม Drizzle ORM + SQLite) |
| `client/` | Vue 3 + TypeScript (`<script setup lang="ts">`), Vue Router, Pinia, Vite |
| `shared/` | Zod schema และ type ที่ใช้ร่วมกันระหว่าง server และ client |
| `docs/` | ไฟล์ `.http` สำหรับทดสอบ API (VS Code REST Client หรือ Bruno) |

## สิ่งที่ต้องติดตั้ง

- Node.js 24 LTS (24.15 ขึ้นไป) หรือ 26 ขึ้นไป ตรวจด้วย `node -v` (ไม่รองรับรุ่นเลขคี่ เช่น 25)
- Git และบัญชี GitHub
- VS Code พร้อมส่วนขยาย Vue (Official) และ REST Client

## เริ่มต้นใช้งาน

```bash
git clone https://github.com/nattaponkum/ssp-2569.git
cd ssp-2569
npm install
npm run dev:server   # http://localhost:8081
npm run dev:client   # http://localhost:5173 (เปิดอีกหน้าต่าง terminal)
```

ตรวจชนิดข้อมูลทั้งโปรเจกต์ด้วย `npm run typecheck`

## โค้ดประจำบท

แต่ละบทมี git tag กำกับ เช่น `ch04-end` ใช้ดูโค้ด ณ ตอนจบบทได้ด้วย

```bash
git checkout ch04-end
```
