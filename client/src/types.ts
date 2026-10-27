// ชนิดข้อมูลผู้ใช้ฝั่ง client (บทที่ 9 จะเปลี่ยนไปใช้ type จาก @ssp/shared ร่วมกับ server)
export interface User {
  id: number
  email: string
  name: string
  lastname: string
}

// ข้อมูลในฟอร์ม (ยังไม่มี id)
export type UserInput = Omit<User, 'id'>
