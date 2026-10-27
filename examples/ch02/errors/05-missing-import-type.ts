// import interface เหมือนเป็นค่า (ลืมคำว่า type)
import { User } from '../modules/user.ts'

const user: User = { id: 1, email: 'steve.jobs@example.com', name: 'Steve', lastname: 'Jobs' }
console.log(user.name)
