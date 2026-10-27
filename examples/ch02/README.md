# บทที่ 2 พื้นฐาน TypeScript สำหรับการโปรแกรมฝั่งเซิร์ฟเวอร์

ต้องใช้ Node.js 24 LTS (24.15 ขึ้นไป) รันคำสั่งทั้งหมดจาก root ของ repo (`ssp-2569/`)

## รันตัวอย่าง

```bash
node examples/ch02/hello.ts
node examples/ch02/01-types.ts
node examples/ch02/02-unions.ts
node examples/ch02/03-arrays.ts
node examples/ch02/04-array-methods.ts
node examples/ch02/05-loops.ts
node examples/ch02/06-functions.ts
node examples/ch02/07-objects.ts
node examples/ch02/08-users-json.ts
node examples/ch02/09-classes.ts
node examples/ch02/modules/app.ts
node examples/ch02/10-async.ts
node examples/ch02/11-read-json.ts
node examples/ch02/lab-solution/app.ts
```

## ตรวจชนิดข้อมูล

```bash
npx tsc -p examples --noEmit
```

ต้องไม่มี error (โฟลเดอร์ `errors/` ถูกยกเว้นไว้)

## ตัวอย่างที่ตั้งใจให้ผิด (`errors/`)

```bash
npx tsc -p examples/ch02/errors            # ดูข้อความ error ของ tsc ทุกไฟล์ในโฟลเดอร์
node examples/ch02/errors/01-why-ts.ts     # Node.js รันได้ เพราะไม่ตรวจชนิดข้อมูล
node examples/ch02/errors/02-not-erasable.ts   # ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX (enum)
node examples/ch02/errors/04-no-extension.ts   # ERR_MODULE_NOT_FOUND (ลืม .ts)
node examples/ch02/errors/05-missing-import-type.ts  # ลืม import type
```

## โครงสร้าง

| ไฟล์ | หัวข้อในบท |
|---|---|
| `hello.ts` | 2.2 เตรียมเครื่องมือ |
| `01-types.ts`, `02-unions.ts` | 2.3 ชนิดข้อมูล |
| `03-arrays.ts`, `04-array-methods.ts` | 2.4 ตัวแปรชุด |
| `05-loops.ts` | 2.5 การวนซ้ำ |
| `06-functions.ts` | 2.6 ฟังก์ชัน |
| `07-objects.ts`, `08-users-json.ts` | 2.7 ออบเจกต์, interface และ JSON |
| `09-classes.ts` | 2.8 วิธีการเชิงวัตถุ |
| `modules/` | 2.9 โมดูล |
| `10-async.ts`, `11-read-json.ts`, `data/users.json` | 2.10 Asynchronous |
| `lab-solution/` | เฉลยแบบปฏิบัติการท้ายบทที่ 2 (สำหรับผู้สอน) |
