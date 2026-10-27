import { ref } from 'vue'
import { defineStore } from 'pinia'

// store สำหรับสถานะของหน้าจอที่หลาย component ใช้ร่วมกัน เช่น ข้อความแจ้งเตือน
// เขียนแบบ setup store: ref = state, function = action
export const useUiStore = defineStore('ui', () => {
  const notice = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined

  // แสดงข้อความแล้วซ่อนเองเมื่อครบเวลา
  function notify(message: string, ms = 3000) {
    notice.value = message
    clearTimeout(timer)
    timer = setTimeout(() => (notice.value = ''), ms)
  }

  return { notice, notify }
})
