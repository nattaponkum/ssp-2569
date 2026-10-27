import sanitizeHtml from 'sanitize-html'

// HTML จาก Rich Text Editor เป็นข้อมูลจากผู้ใช้ ต้อง "ทำความสะอาด" ก่อนบันทึก
// อนุญาตเฉพาะแท็กและ attribute ที่ editor ใช้ ที่เหลือ (เช่น <script>, onerror=) ถูกตัดทิ้ง
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 's', 'u', 'code', 'pre', 'blockquote',
    'h2', 'h3', 'ul', 'ol', 'li', 'hr', 'a', 'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
  },
  // ลิงก์ใช้ได้เฉพาะ http, https, mailto (กัน javascript:) รูปใช้ได้เฉพาะ https หรือ path ในเว็บเรา
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  // ลิงก์ออกนอกเว็บเปิดแท็บใหม่ และไม่ให้หน้าปลายทางเข้าถึงหน้าเราผ่าน window.opener
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
  },
}

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, options)
}

// แปลง HTML เป็นข้อความล้วน (ใช้ทำ excerpt ในหน้ารายการ)
export function htmlToText(html: string): string {
  // เว้นวรรคท้ายย่อหน้า/บรรทัด ไม่ให้คำของสองย่อหน้าติดกัน
  const spaced = html.replace(/<\/(p|h2|h3|li|blockquote|pre)>|<br\s*\/?>/gi, ' $&')
  const text = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
  // sanitize-html escape อักขระพิเศษไว้ แปลงกลับเป็นตัวอักษรปกติ (Vue จะ escape ให้อีกครั้งตอนแสดง)
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}
