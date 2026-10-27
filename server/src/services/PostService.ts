import { and, desc, eq } from 'drizzle-orm'
import type { PostCreate, PostUpdate } from '@ssp/shared'
import type { Db } from '../db/client.ts'
import { posts, users } from '../db/schema.ts'
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
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
}

const EXCERPT_LENGTH = 200

// หน้ารายการไม่ส่งเนื้อหาเต็ม ส่งแค่ข้อความย่อ (excerpt)
function toSummary<T extends { content: string }>({ content, ...rest }: T) {
  return { ...rest, excerpt: content.slice(0, EXCERPT_LENGTH) }
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
    return this.selectPosts()
      .where(and(eq(posts.id, id), eq(posts.status, 'published')))
      .get()
  }

  // สำหรับหน้าจัดการ: admin เห็นทุกบทความ ผู้ใช้ทั่วไปเห็นเฉพาะของตัวเอง
  async listForUser(user: AuthUser) {
    const query = this.selectPosts()
    const rows = await (user.role === 'admin' ? query : query.where(eq(posts.authorId, user.id)))
    return rows.map(toSummary)
  }

  async findById(id: number) {
    return this.selectPosts().where(eq(posts.id, id)).get()
  }

  // แก้ไขหรือลบได้เฉพาะเจ้าของบทความหรือ admin
  canModify(user: AuthUser, post: { authorId: number }): boolean {
    return user.role === 'admin' || post.authorId === user.id
  }

  async create(authorId: number, data: PostCreate) {
    const { id } = this.db.insert(posts).values({ ...data, authorId }).returning().get()
    return (await this.findById(id))!
  }

  async update(id: number, data: PostUpdate) {
    this.db.update(posts).set(data).where(eq(posts.id, id)).run()
    return this.findById(id)
  }

  async remove(id: number): Promise<boolean> {
    const result = this.db.delete(posts).where(eq(posts.id, id)).run()
    return result.changes > 0
  }
}
