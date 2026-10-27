// unknown ต้องตรวจก่อนใช้ และ readonly ห้ามแก้ไข
const data: unknown = JSON.parse('{"name":"Steve"}')
console.log(data.name)

const weekdays: readonly string[] = ['จ.', 'อ.', 'พ.']
weekdays.push('พฤ.')

interface Post {
  readonly id: number
  title: string
}
const post: Post = { id: 1, title: 'Hello' }
post.id = 2
