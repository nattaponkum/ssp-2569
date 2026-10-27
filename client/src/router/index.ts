import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/public/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/admin/users',
      name: 'admin-users',
      // โหลดเมื่อเข้าหน้านี้ครั้งแรก (lazy loading) ไฟล์ JS ของหน้าแรกจึงเล็กลง
      component: () => import('@/views/admin/UsersView.vue'),
    },
  ],
})

export default router
