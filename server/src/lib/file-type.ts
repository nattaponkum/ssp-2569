// ตรวจชนิดไฟล์รูปจาก "magic bytes" คือไบต์แรก ๆ ของไฟล์ที่บอกรูปแบบจริงของไฟล์
// ห้ามเชื่อนามสกุลไฟล์หรือ Content-Type ที่ client ส่งมา เพราะปลอมได้ง่าย

export interface ImageType {
  mime: string
  ext: string
}

// ไบต์ที่ต้องพบ เริ่มที่ตำแหน่ง offset ของไฟล์
interface Signature extends ImageType {
  offset: number
  bytes: number[]
}

const signatures: Signature[] = [
  // \x89PNG\r\n\x1a\n
  {
    mime: 'image/png',
    ext: 'png',
    offset: 0,
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  { mime: 'image/jpeg', ext: 'jpg', offset: 0, bytes: [0xff, 0xd8, 0xff] },
  // GIF87a หรือ GIF89a ขึ้นต้นด้วย GIF8 เหมือนกัน
  { mime: 'image/gif', ext: 'gif', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  // WebP: "RIFF" ที่ไบต์ 0 และ "WEBP" ที่ไบต์ 8 (ตรวจ RIFF แยกด้านล่าง)
  { mime: 'image/webp', ext: 'webp', offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
]

const RIFF = [0x52, 0x49, 0x46, 0x46]

function startsWith(data: Uint8Array, bytes: number[], offset: number): boolean {
  return bytes.every((byte, i) => data[offset + i] === byte)
}

// คืนชนิดของรูป ถ้าไม่ใช่รูปที่รองรับคืน null
export function detectImageType(data: Uint8Array): ImageType | null {
  for (const { mime, ext, offset, bytes } of signatures) {
    if (ext === 'webp' && !startsWith(data, RIFF, 0)) continue
    if (startsWith(data, bytes, offset)) return { mime, ext }
  }
  return null
}
