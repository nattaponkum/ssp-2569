import { and, desc, eq } from 'drizzle-orm'
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

  // สำหรับผู้อ่านทั่วไป: เฉพาะบทความที่เผยแพร่แล้ว
  async listPublished() {
    const rows = await this.selectPosts().where(eq(posts.status, 'published'))
    return rows.map(toSummary)
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
