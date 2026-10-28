import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './client.ts'

// รัน migration ด้วย drizzle-orm โดยตรง (ไม่ต้องใช้ drizzle-kit ซึ่งเป็น devDependency)
// ใช้ตอน deploy: Docker image ไม่มี devDependencies จึงรัน `npm run db:migrate` ไม่ได้
migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) })
console.log('migration เสร็จแล้ว')
