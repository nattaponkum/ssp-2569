<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginSchema } from '@ssp/shared'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// หน้าที่จะไปต่อหลัง login (route guard ใส่ไว้ใน ?redirect=)
// รับเฉพาะ path ภายในเว็บเรา ('/...' แต่ไม่ใช่ '//...') กันการถูกพาไปเว็บอื่น (open redirect)
function nextPage(): string {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/admin'
}

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  const result = loginSchema.safeParse(form)
  if (!result.success) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await auth.login(result.data)
    await router.push(nextPage())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section>
    <h1>เข้าสู่ระบบ</h1>
    <form novalidate @submit.prevent="onSubmit">
      <label>
        อีเมล
        <input v-model="form.email" type="email" autocomplete="username" />
      </label>
      <label>
        รหัสผ่าน
        <input v-model="form.password" type="password" autocomplete="current-password" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <div>
        <button type="submit" class="primary" :disabled="loading">เข้าสู่ระบบ</button>
      </div>
    </form>
  </section>
</template>
