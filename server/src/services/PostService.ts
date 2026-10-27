import { and, desc, eq, lt, or, sql, type SQL } from 'drizzle-orm'
import type { PostCreate, PostUpdate } from '@ssp/shared'
import type { Db } from '../db/client.ts'
import { posts, users } from '../db/schema.ts'
import { htmlToText, sanitizePostHtml } from '../lib/html.ts'
import type { AuthUser } from '../lib/token.ts'

// คอลัมน์ที่เลือกมาทุกครั้ง: ข้อมูลบทความ + ชื่อผู้เขียนจากตาราง users (ได้มาด้วยการ join)
const postColumns = {
  id: posts.id,
  authorId: posts.authorId,
  authorName: users.name,
  title: posts.title,
  content: posts.content,
  category: posts.category,
  status: posts.status,
  thumbnail: posts.thumbnail,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
}

const EXCERPT_LENGTH = 200

// หน้ารายการไม่ส่งเนื้อหาเต็ม ส่งแค่ข้อความย่อ (excerpt) ที่ตัดแท็ก HTML ออกแล้ว
function toSummary<T extends { content: string }>({ content, ...rest }: T) {
  return { ...rest, excerpt: htmlToText(content).slice(0, EXCERPT_LENGTH) }
}

// ใน LIKE ตัว % และ _ เป็นอักขระพิเศษ (แทนอะไรก็ได้) ต้อง escape ด้วย \ ก่อน
// ไม่เช่นนั้นผู้ใช้ค้นหา "%" จะได้บทความทั้งหมด
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

// เงื่อนไข "คอลัมน์มีคำนี้อยู่" แบบ escape แล้ว
function contains(column: typeof posts.title | typeof posts.content, text: string): SQL {
  return sql`${column} LIKE ${`%${escapeLike(text)}%`} ESCAPE '\\'`
}

export interface ListOptions {
  search?: string
  category?: string
  cursor?: number
  limit: number
}

// sanitize ซ้ำตอนอ่านอีกชั้น (defense in depth) เผื่อข้อมูลเก่าที่บันทึกไว้ก่อนมีการ sanitize
function withSafeContent<T extends { content: string }>(post: T | undefined): T | undefined {
  return post && { ...post, content: sanitizePostHtml(post.content) }
}

export class PostService {
  private db: Db

  constructor(db: Db) {
    this.db = db
  }

  // query พื้นฐาน: posts join users เรียงจากใหม่ไปเก่า
  private selectPosts() {
    return this.db
      .select(postColumns)
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.id))
      .$dynamic()
  }

  // สำหรับผู้อ่านทั่วไป: เฉพาะบทความที่เผยแพร่แล้ว พร้อมค้นหา กรองหมวดหมู่ และแบ่งหน้าแบบ cursor
  async listPublished({ search, category, cursor, limit }: ListOptions) {
    // รวมเงื่อนไขเฉพาะที่ผู้ใช้ส่งมา (and() ข้ามค่า undefined ให้เอง)
    const where = and(
      eq(posts.status, 'published'),
      search ? or(contains(posts.title, search), contains(posts.content, search)) : undefined,
      category ? eq(posts.category, category) : undefined,
      cursor ? lt(posts.id, cursor) : undefined,
    )

    // ขอเกินมา 1 แถว เพื่อรู้ว่ายังมีหน้าถัดไปหรือไม่
    const rows = await this.selectPosts().where(where).limit(limit + 1)
    const hasMore = rows.length > limit
    const items = rows.slice(0, limit).map(toSummary)
    return { items, nextCursor: hasMore ? items[items.length - 1]!.id : null }
  }

  // หมวดหมู่ทั้งหมดที่มีบทความเผยแพร่แล้ว (ไม่ซ้ำ เรียงตามตัวอักษร)
  async listCategories(): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ category: posts.category })
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(posts.category)
    return rows.map((row) => row.category)
  }

  async findPublishedById(id: number) {
    const post = this.selectPosts()
      .where(and(eq(posts.id, id), eq(posts.status, 'published')))
      .get()
    return withSafeContent(post)
  }

  // สำหรับหน้าจัดการ: admin เห็นทุกบทความ ผู้ใช้ทั่วไปเห็นเฉพาะของตัวเอง
  async listForUser(user: AuthUser) {
    const query = this.selectPosts()
    const rows = await (user.role === 'admin' ? query : query.where(eq(posts.authorId, user.id)))
    return rows.map(toSummary)
  }

  async findById(id: number) {
    return withSafeContent(this.selectPosts().where(eq(posts.id, id)).get())
  }

  // แก้ไขหรือลบได้เฉพาะเจ้าของบทความหรือ admin
  canModify(user: AuthUser, post: { authorId: number }): boolean {
    return user.role === 'admin' || post.authorId === user.id
  }

  async create(authorId: number, data: PostCreate) {
    // ทำความสะอาด HTML ก่อนบันทึกทุกครั้ง
    const values = { ...data, content: sanitizePostHtml(data.content), authorId }
    const { id } = this.db.insert(posts).values(values).returning().get()
    return (await this.findById(id))!
  }

  async update(id: number, data: PostUpdate) {
    const values = data.content ? { ...data, content: sanitizePostHtml(data.content) } : data
    this.db.update(posts).set(values).where(eq(posts.id, id)).run()
    return this.findById(id)
  }

  async remove(id: number): Promise<boolean> {
    const result = this.db.delete(posts).where(eq(posts.id, id)).run()
    return result.changes > 0
  }
}
