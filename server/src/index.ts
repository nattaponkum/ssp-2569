import { serve } from '@hono/node-server'
import { app } from './app.ts'
import { config } from './config.ts'

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  console.log(`Server is running on http://localhost:${info.port} (${config.NODE_ENV})`)
})

// ปิด server อย่างนุ่มนวลเมื่อถูกสั่งหยุด (docker stop ส่ง SIGTERM, กด Ctrl+C ส่ง SIGINT)
// โดยรอ request ที่ค้างอยู่ให้เสร็จก่อน
function shutdown() {
  server.close(() => process.exit(0))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
