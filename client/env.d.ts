/// <reference types="vite/client" />

// ตัวแปรจากไฟล์ .env ที่ client ใช้ (Vite เปิดเผยเฉพาะตัวที่ขึ้นต้นด้วย VITE_)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
