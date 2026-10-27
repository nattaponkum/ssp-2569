import { onBeforeUnmount, onMounted, type Ref } from 'vue'

// เลื่อนหน้าจอจนเห็น element "ตัวเฝ้า" (target) ท้ายรายการ แล้วเรียก loadMore ให้โหลดหน้าถัดไป
// loadMore คืนค่า true ถ้ายังอาจมีข้อมูลอีก และ false เมื่อหมดแล้ว
export function useInfiniteScroll(
  target: Ref<HTMLElement | null>,
  loadMore: () => Promise<boolean>,
) {
  let observer: IntersectionObserver | undefined
  let loading = false

  // สั่งให้ observer ตรวจใหม่ (observe ซ้ำแล้ว browser จะรายงานสถานะปัจจุบันทันที)
  // ใช้หลังโหลดเสร็จ: ถ้าข้อมูลยังไม่เต็มจอ ตัวเฝ้ายังมองเห็นอยู่ ก็จะโหลดหน้าถัดไปต่อ
  function check() {
    if (!observer || !target.value) return
    observer.unobserve(target.value)
    observer.observe(target.value)
  }

  async function onIntersect(entries: IntersectionObserverEntry[]) {
    if (!entries[0]?.isIntersecting || loading) return
    loading = true
    let hasMore = false
    try {
      hasMore = await loadMore()
    } finally {
      loading = false
    }
    if (hasMore) check()
  }

  onMounted(() => {
    // rootMargin: เริ่มโหลดก่อนเลื่อนถึงจริง 200px ผู้ใช้จะไม่ต้องรอ
    observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' })
    if (target.value) observer.observe(target.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { check }
}
