import { UserRepository, greetThai, greetEnglish } from './index.ts'
import type { User } from './index.ts'

const repo = new UserRepository()
repo.add({ email: 'nattapon@example.com', name: 'Nattapon', lastname: 'Kumyaito' })
repo.add({ email: 'steve.jobs@example.com', name: 'Steve', lastname: 'Jobs' })

const users: User[] = repo.findAll()
for (const user of users) {
  console.log(greetThai(user), '|', greetEnglish(user))
}
