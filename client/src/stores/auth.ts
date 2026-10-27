import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginInput, User } from '@ssp/shared'
import { authApi } from '@/api/auth'

// สถานะการเข้าสู่ระบบที่ทุกหน้าใช้ร่วมกัน
// (เก็บแค่ข้อมูลผู้ใช้ ส่วน token อยู่ใน cookie ที่ JavaScript อ่านไม่ได้)
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  // ถาม server แล้วหรือยังว่า login อยู่หรือไม่ (route guard ใช้ตัดสินใจว่าต้องเรียก fetchMe ไหม)
  const checked = ref(false)
  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(data: LoginInput) {
    user.value = await authApi.login(data)
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  // ถาม server ว่าตอนนี้ login อยู่หรือไม่ (เช่น หลังกด refresh หน้าเว็บ)
  async function fetchMe() {
    try {
      user.value = await authApi.me()
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  return { user, checked, isLoggedIn, isAdmin, login, logout, fetchMe }
})
