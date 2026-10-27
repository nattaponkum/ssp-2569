import { createRouter, createWebHistory } from 'vue-router'
import type { Role } from '@ssp/shared'
import AdminLayout from '@/layouts/AdminLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/public/HomeView.vue'

// บอก TypeScript ว่า meta ของ route มีฟิลด์อะไรบ้าง
declare module 'vue-router' {
  interface RouteMeta {
    // ต้อง login ก่อน
    requiresAuth?: boolean
    // ต้องมีบทบาทนี้
    role?: Role
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // หน้าสำหรับผู้อ่านทั่วไป (Front Office)
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/admin/LoginView.vue'),
        },
        {
          path: '403',
          name: 'forbidden',
          component: () => import('@/views/public/ForbiddenView.vue'),
        },
      ],
    },
    // หน้าจัดการ (Back Office): meta ของ parent มีผลกับ route ลูกทุกตัว
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'admin-users' } },
        {
          path: 'users',
          name: 'admin-users',
          // โหลดเมื่อเข้าหน้านี้ครั้งแรก (lazy loading) ไฟล์ JS ของหน้าแรกจึงเล็กลง
          component: () => import('@/views/admin/UsersView.vue'),
          meta: { role: 'admin' },
        },
      ],
    },
    // path อื่นทั้งหมดที่ไม่ตรงกับข้างบน
    {
      path: '/:pathMatch(.*)*',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'not-found',
          component: () => import('@/views/public/NotFoundView.vue'),
        },
      ],
    },
  ],
})

// route guard: ทำงานก่อนเปลี่ยนหน้าทุกครั้ง
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // ครั้งแรกที่เปิดเว็บยังไม่รู้ว่า login อยู่หรือไม่ ให้ถาม server ก่อน (cookie มองไม่เห็นจาก JavaScript)
  if (!auth.checked) await auth.fetchMe()

  // ยังไม่ login: ส่งไปหน้า login และจำหน้าที่ตั้งใจจะไปไว้ใน query
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // login แล้วแต่บทบาทไม่ตรง
  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return { name: 'forbidden' }
  }
})

export default router
