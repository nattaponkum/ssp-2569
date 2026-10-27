import { initialMenu } from './coffee.ts'
import type { Coffee } from './coffee.ts'
import {
  listAvailable,
  findCoffee,
  orderTotal,
  addCoffee,
  removeCoffee,
  averagePrice,
} from './menu-functions.ts'
import { CoffeeMenu } from './coffee-menu.ts'

function printMenu(title: string, items: Coffee[]): void {
  console.log(title)
  for (const c of items) {
    const status = c.available ? '' : ' (หมด)'
    console.log(`  ${c.id}. ${c.name.padEnd(11)} ${c.type.padEnd(6)} ${c.price} บาท${status}`)
  }
}

function tryOrder(label: string, order: () => number): void {
  try {
    console.log(`${label}: ${order()} บาท`)
  } catch (error) {
    console.log(`${label}: สั่งไม่ได้ - ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log('===== ส่วนที่ 1: ฟังก์ชัน =====')
const menu: Coffee[] = [...initialMenu]
printMenu('เมนูที่พร้อมขาย:', listAvailable(menu))
console.log('ค้นหา id 2:', findCoffee(menu, 2)?.name ?? 'ไม่พบ')
console.log('ค้นหา id 9:', findCoffee(menu, 9)?.name ?? 'ไม่พบ')
tryOrder('ออเดอร์ [1, 2, 2]', () => orderTotal(menu, [1, 2, 2]))
tryOrder('ออเดอร์ [3]', () => orderTotal(menu, [3]))
tryOrder('ออเดอร์ [9]', () => orderTotal(menu, [9]))
addCoffee(menu, { id: 6, name: 'Matcha', price: 75, type: 'frappe', available: true })
console.log('ลบ id 1:', removeCoffee(menu, 1), '| ลบ id 1 ซ้ำ:', removeCoffee(menu, 1))
printMenu('เมนูทั้งหมดหลังเพิ่ม/ลบ:', menu)
console.log('ราคาเฉลี่ย:', averagePrice(menu).toFixed(2), 'บาท')

console.log('===== ส่วนที่ 2: คลาส CoffeeMenu =====')
const shop = new CoffeeMenu(initialMenu)
shop.add({ id: 6, name: 'Matcha', price: 75, type: 'frappe', available: true })
console.log('จำนวนเมนู:', shop.count)
printMenu('เมนูแบบเย็น:', shop.listByType('iced'))
tryOrder('ออเดอร์ [2, 4, 6]', () => shop.orderTotal([2, 4, 6]))
console.log('ลบ id 3:', shop.remove(3), '| เหลือ', shop.count, 'เมนู')
console.log('ราคาเฉลี่ย:', shop.averagePrice().toFixed(2), 'บาท')
console.log('initialMenu ยังมี', initialMenu.length, 'เมนู (ไม่ถูกแก้ไข)')
