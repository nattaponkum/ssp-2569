import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { config } from '../config.ts'
import type { Db } from '../db/client.ts'
import { images } from '../db/schema.ts'
import type { ImageType } from '../lib/file-type.ts'
import type { AuthUser } from '../lib/token.ts'

// ขนาดไฟล์สูงสุด 2 MB
export const MAX_UPLOAD_SIZE = 2 * 1024 * 1024

export interface UploadedImage {
  id: number
  url: string
}

export class ImageService {
  private db: Db

  constructor(db: Db) {
    this.db = db
  }

  // บันทึกไฟล์ลงดิสก์ด้วยชื่อสุ่ม แล้วบันทึกข้อมูลไฟล์ลงตาราง images
  async save(ownerId: number, data: Uint8Array, type: ImageType): Promise<UploadedImage> {
    // ตั้งชื่อเองด้วย UUID: กันชื่อซ้ำ และกันชื่อไฟล์อันตราย เช่น ../../etc/passwd
    const filename = `${randomUUID()}.${type.ext}`
    await mkdir(config.UPLOAD_DIR, { recursive: true })
    await writeFile(join(config.UPLOAD_DIR, filename), data)

    const image = this.db
      .insert(images)
      .values({ ownerId, filename, mimeType: type.mime, size: data.byteLength })
      .returning()
      .get()
    return { id: image.id, url: `/uploads/${image.filename}` }
  }

  async findById(id: number) {
    return this.db.select().from(images).where(eq(images.id, id)).get()
  }

  // ลบได้เฉพาะเจ้าของไฟล์หรือ admin
  canModify(user: AuthUser, image: { ownerId: number }): boolean {
    return user.role === 'admin' || image.ownerId === user.id
  }

  async remove(id: number): Promise<void> {
    const image = await this.findById(id)
    if (!image) return
    this.db.delete(images).where(eq(images.id, id)).run()
    // ไฟล์อาจถูกลบไปก่อนแล้ว ไม่ถือเป็น error
    await unlink(join(config.UPLOAD_DIR, image.filename)).catch(() => {})
  }
}
