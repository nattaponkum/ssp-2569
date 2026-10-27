<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { PostSummary } from '@ssp/shared'
import { postsApi } from '@/api/posts'
import CategoryMenu from '@/components/CategoryMenu.vue'
import PostCard from '@/components/PostCard.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const route = useRoute()
const router = useRouter()

// อ่านค่าจาก URL query (เช่น /?search=vue&category=บทเรียน) ผู้ใช้จึงแชร์ลิงก์ผลการค้นหาได้
function queryText(name: string): string {
  const value = route.query[name]
  return typeof value === 'string' ? value : ''
}

const posts = ref<PostSummary[]>([])
const nextCursor = ref<number | undefined>(undefined)
const done = ref(false)
const loading = ref(false)
const error = ref('')
const search = ref(queryText('search'))
const sentinel = ref<HTMLElement | null>(null)

// นับรอบการค้นหา: ถ้าผู้ใช้เปลี่ยนคำค้นระหว่างที่คำขอเดิมยังไม่กลับมา ให้ทิ้งผลของคำขอเดิม
let generation = 0

async function loadMore(): Promise<boolean> {
  if (done.value) return false
  const current = generation
  loading.value = true
  error.value = ''
  try {
    const page = await postsApi.list({
      search: queryText('search'),
      category: queryText('category'),
      cursor: nextCursor.value,
    })
    // ผู้ใช้เปลี่ยนคำค้นระหว่างรอ: ทิ้งผลนี้ แล้วตอบ true ให้ useInfiniteScroll ตรวจใหม่และโหลดของรอบใหม่
    if (current !== generation) return true
    posts.value.push(...page.items)
    nextCursor.value = page.nextCursor ?? undefined
    done.value = page.nextCursor === null
  } catch (e) {
    if (current !== generation) return true
    error.value = e instanceof Error ? e.message : 'โหลดบทความไม่สำเร็จ'
    done.value = true
  } finally {
    loading.value = false
  }
  return !done.value
}

const { check } = useInfiniteScroll(sentinel, loadMore)

// debounce: รอให้หยุดพิมพ์ 300ms ก่อนค่อยเปลี่ยน URL (ไม่ยิงคำขอทุกครั้งที่กดแป้น)
let timer: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    router.replace({ query: { ...route.query, search: value || undefined } })
  }, 300)
})

// URL เปลี่ยน (ค้นหา เลือกหมวดหมู่ หรือกดย้อนกลับ) → ล้างรายการแล้วโหลดหน้าแรกใหม่
watch(
  () => [route.query.search, route.query.category],
  () => {
    search.value = queryText('search')
    generation++
    posts.value = []
    nextCursor.value = undefined
    done.value = false
    check()
  },
)
</script>

<template>
  <section>
    <h1>บทความล่าสุด</h1>
    <input v-model="search" type="search" placeholder="ค้นหาบทความ..." class="search" />
    <CategoryMenu />

    <PostCard v-for="post in posts" :key="post.id" :post="post" />

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted">กำลังโหลด...</p>
    <p v-else-if="done && posts.length === 0" class="muted">ไม่พบบทความ</p>
    <p v-else-if="done" class="muted">แสดงครบทุกบทความแล้ว</p>
    <!-- ตัวเฝ้าท้ายรายการ: เมื่อเลื่อนมาเห็น จะโหลดหน้าถัดไป -->
    <div ref="sentinel"></div>
  </section>
</template>

<style scoped>
.search {
  width: 100%;
}
</style>
