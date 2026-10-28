# ssp-2569

โค้ดตัวอย่างประกอบหนังสือ **Server Side Programming (273372) ฉบับ 2569**
ภาคเรียนที่ 2 ปีการศึกษา 2569

ตัวอย่างหลักของเล่มคือระบบเว็บบล็อก (Blog) ที่มีทั้งหน้าสำหรับผู้อ่าน (Front Office) และหน้าจัดการสำหรับผู้เขียนและผู้ดูแล (Back Office)

- ผู้อ่าน: ดูรายการบทความที่เผยแพร่แล้ว ค้นหา กรองตามหมวดหมู่ เลื่อนดูต่อไปเรื่อย ๆ (infinite scroll) และอ่านบทความ
- ผู้ใช้ที่ login (role `user`): เขียน แก้ไข ลบบทความของตัวเองด้วย Rich Text Editor อัปโหลดรูปปกและรูปในบทความ
- ผู้ดูแล (role `admin`): จัดการบทความทุกเรื่องและจัดการผู้ใช้

## โครงสร้าง repo

| โฟลเดอร์ | เทคโนโลยี / เนื้อหา |
|---|---|
| `server/` | [Hono](https://hono.dev) + TypeScript รันด้วย Node.js 24 โดยตรง, Drizzle ORM + SQLite (better-sqlite3), Zod, Vitest |
| `client/` | Vue 3 (`<script setup lang="ts">`), Vue Router, Pinia, Vite, TipTap (Rich Text Editor) |
| `shared/` | Zod schema และ type ที่ใช้ร่วมกันระหว่าง server และ client |
| `docs/` | ไฟล์ `.http` สำหรับทดสอบเว็บเซอร์วิสด้วย VS Code REST Client |
| `examples/` | โค้ดตัวอย่างประกอบเนื้อหาบทที่ 1–3 |

ภายใน `server/src/`

```
index.ts            เริ่ม server (อ่าน PORT จาก config)
app.ts              รวม middleware และ mount route ทั้งหมดใต้ /api, เสิร์ฟ /uploads และ client/dist
config.ts           อ่านและตรวจค่า env ด้วย Zod
db/                 schema.ts, client.ts, seed.ts, migrate.ts (migration อยู่ที่ server/drizzle/)
services/           UserService, AuthService, PostService, ImageService (business logic + query)
routes/             users.ts, auth.ts, posts.ts, uploads.ts (รับ request ตรวจ input เรียก service ตอบ JSON)
middlewares/        auth.ts (requireAuth, requireRole), error-handler.ts
lib/                password.ts (scrypt), token.ts (JWT), html.ts (sanitize), file-type.ts, validator.ts
test/               Vitest + app.request()
```

## เว็บเซอร์วิส (API)

ทุก endpoint อยู่ใต้ `/api` error ตอบรูปแบบเดียวกันทั้งระบบคือ `{ "error": "ข้อความ" }` และกรณีข้อมูลไม่ผ่าน Zod คือ `{ "error": "Invalid input", "issues": [...] }` (400)

| Method และ path | สิทธิ์ | หน้าที่ |
|---|---|---|
| `POST /api/auth/register`, `POST /api/auth/login` | ทุกคน | สมัคร / เข้าสู่ระบบ (ได้ cookie `token` แบบ httpOnly) |
| `POST /api/auth/logout`, `GET /api/auth/me` | login | ออกจากระบบ / ข้อมูลผู้ใช้ปัจจุบัน |
| `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id` | admin | จัดการผู้ใช้ |
| `GET /api/posts?search=&category=&cursor=&limit=` | ทุกคน | บทความที่เผยแพร่ แบ่งหน้า `{ items, nextCursor }` |
| `GET /api/posts/:id`, `GET /api/categories` | ทุกคน | อ่านบทความ / รายชื่อหมวดหมู่ |
| `POST /api/posts`, `PATCH/DELETE /api/posts/:id` | login (เจ้าของหรือ admin) | เขียน แก้ไข ลบบทความ |
| `GET /api/admin/posts`, `GET /api/admin/posts/:id` | login | บทความสำหรับหน้าจัดการ (รวมฉบับร่าง) |
| `POST /api/uploads`, `DELETE /api/uploads/:id` | login (เจ้าของหรือ admin) | อัปโหลดรูป (field `file`, ไม่เกิน 2 MB, PNG/JPEG/WebP/GIF) / ลบรูป |

ตัวอย่างคำขอทั้งหมดอยู่ใน `docs/*.http`

## สิ่งที่ต้องติดตั้ง

- Node.js 24 LTS (24.15 ขึ้นไป) หรือ 26 ขึ้นไป ตรวจด้วย `node -v` (ไม่รองรับรุ่นเลขคี่ เช่น 25)
- Git และบัญชี GitHub
- VS Code พร้อมส่วนขยาย Vue (Official) และ REST Client

## เริ่มต้นใช้งานบนเครื่องของตัวเอง

```bash
git clone https://github.com/nattaponkum/ssp-2569.git
cd ssp-2569
npm install
```

ไฟล์ `.npmrc` ปิด install script ของแพ็กเกจไว้ (`ignore-scripts=true`) เพื่อให้ติดตั้ง better-sqlite3 บน Windows ได้โดยไม่ต้องมี Visual Studio Build Tools

### 1. ตั้งค่า server

คัดลอก `server/.env.example` เป็น `server/.env` แล้วใส่ค่า

```bash
# สุ่ม JWT_SECRET (ยาวอย่างน้อย 32 ตัวอักษร) แล้วนำไปใส่ใน server/.env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

ต้องตั้ง `JWT_SECRET` และ `ADMIN_PASSWORD` (อย่างน้อย 8 ตัวอักษร) ถ้าไม่ตั้ง server จะไม่ยอมเริ่มทำงานและบอกว่าขาดค่าใด ไฟล์ `.env` อยู่ใน `.gitignore` ห้าม commit

### 2. สร้างฐานข้อมูลและข้อมูลตัวอย่าง

```bash
npm run db:migrate   # สร้างตารางตามไฟล์ใน server/drizzle/ (ไฟล์ฐานข้อมูลอยู่ที่ server/data/app.sqlite)
npm run db:seed      # สร้างบัญชี admin ตาม ADMIN_EMAIL/ADMIN_PASSWORD และบทความตัวอย่าง
```

ถ้าแก้ `server/src/db/schema.ts` ให้สร้างไฟล์ migration ใหม่ด้วย `npm run db:generate -- --name ชื่อการเปลี่ยนแปลง` แล้วรัน `npm run db:migrate` อีกครั้ง

### 3. รัน server และ client (เปิด terminal สองหน้าต่าง)

```bash
npm run dev:server   # http://localhost:8081 (node --watch รีสตาร์ตเองเมื่อแก้ไฟล์)
npm run dev:client   # http://localhost:5173
```

เปิด http://localhost:5173 แล้วเข้าสู่ระบบด้วยบัญชี admin ที่ตั้งไว้ใน `server/.env`
client เรียก server ตามค่า `VITE_API_URL` (ค่าเริ่มต้น `http://localhost:8081` ดู `client/.env.example`) และ Vite ส่งต่อคำขอ `/uploads/...` ไปที่ server ให้เอง

## ตรวจโค้ดและทดสอบ

```bash
npm run typecheck              # tsc ของ shared, server, examples และ vue-tsc ของ client
npm test                       # Vitest ของ server (ใช้ฐานข้อมูลในหน่วยความจำ) และ client
npm run build                  # build client ไปที่ client/dist
npm run lint -w @ssp/client    # oxlint + eslint ของ client
```

## รันแบบ production บนเครื่องตัวเอง

ใน production server ตัวเดียวเสิร์ฟทั้งเว็บเซอร์วิส (`/api`), ไฟล์อัปโหลด (`/uploads`) และหน้าเว็บจาก `client/dist` (path อื่นได้ `index.html` ให้ Vue Router จัดการ) หน้าเว็บกับ API จึงอยู่ origin เดียวกัน

```bash
npm run build                                                                     # build client ไปที่ client/dist
NODE_ENV=production CLIENT_ORIGIN=http://localhost:8081 npm start -w @ssp/server  # เปิด http://localhost:8081
```

ด้านความปลอดภัยที่เปิดไว้แล้ว: รหัสผ่านเก็บเป็น scrypt hash (N=2^17, r=8, p=1 ตามคำแนะนำขั้นต่ำของ OWASP), จำกัด login ผิดได้ 5 ครั้งต่อ IP + อีเมลใน 15 นาที (ตัวนับอยู่ในหน่วยความจำของ process เดียว), JWT ใน cookie `httpOnly` + `SameSite=Lax` + `Secure` (production) และตรวจผู้ใช้กับ role ล่าสุดจากฐานข้อมูลทุก request, ตรวจ Origin ด้วย `hono/csrf`, security headers และ Content-Security-Policy ด้วย `hono/secure-headers`, ตรวจ input ทุก endpoint ด้วย Zod, sanitize HTML ของบทความ, ตรวจไฟล์อัปโหลดจาก magic bytes ตั้งชื่อไฟล์ใหม่ด้วย UUID และลบไฟล์ที่ไม่มีใครใช้แล้ว

## โค้ดประจำบท

แต่ละบทมี git tag กำกับสภาพโค้ดตอนจบบท ดูความเปลี่ยนแปลงของบทใดก็ได้ด้วย `git diff ch05-end ch06-end`

```bash
git checkout ch06-end   # ดูโค้ด ณ ตอนจบบทที่ 6
git checkout main       # กลับมาที่โค้ดล่าสุด
```

| tag | บท | สิ่งที่เพิ่มในบทนี้ |
|---|---|---|
| `ch03-end` | 1–3 | โครง monorepo และตัวอย่างประกอบบทที่ 1–3 |
| `ch04-end` | 4 เริ่มต้นสร้าง Web Server ด้วย Hono | `/api/hello`, users CRUD ใน array, status code, `node --watch`, Vitest |
| `ch05-end` | 5 จัดโครงสร้างโค้ดแบบ MVC และวิธีการเชิงวัตถุ | `routes/users.ts`, `class UserService implements UserRepository` |
| `ch06-end` | 6 การเชื่อมฐานข้อมูลและการสืบค้นด้วย Drizzle ORM | SQLite, schema, migration, seed |
| `ch07-end` | 7 การจัดการรูปแบบการนำเข้าและการตรวจสอบด้วย Zod | schema ใน `shared/`, zValidator, error format กลาง, 409 |
| `ch08-end` | 8 (Crash Course) Vue 3 กับ TypeScript | router, component (props/emits), Pinia |
| `ch09-end` | 9 เชื่อมต่อไคลเอนต์กับเว็บเซอร์วิส | `src/api/`, CORS, loading/error, ตรวจฟอร์มด้วย schema เดียวกับ server |
| `ch10-end` | 10 เทคนิคการพิสูจน์ตัวตนและการจัดการข้อมูลการเข้าใช้งาน | scrypt, JWT ใน cookie, role, CSRF, หน้า login |
| `ch11-end` | 11 จัดระเบียบ Front End: Layout, Navbar และ Route Guard | layout, NavBar, route guard, หน้า 403/404 |
| `ch12-end` | 12 สร้างระบบ Blog | ตาราง posts, ความเป็นเจ้าของบทความ, หน้าบทความและหน้าจัดการ |
| `ch13-end` | 13 Rich Text Editor และการอัปโหลดไฟล์อย่างปลอดภัย | TipTap, sanitize-html, อัปโหลดรูป, รูปปก |
| `ch14-end` | 14 การสืบค้นและการแบ่งหน้าข้อมูล | ค้นหา, หมวดหมู่, cursor pagination, infinite scroll |
| `ch15-end` | 15 มาตรฐานและการจัดการเว็บ และความปลอดภัยก่อนใช้งานจริง | security headers, logger, config, origin เดียว, hardening |
