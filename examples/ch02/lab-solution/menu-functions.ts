import type { Coffee } from './coffee.ts'

export function listAvailable(menu: Coffee[]): Coffee[] {
  return menu.filter((c) => c.available)
}

export function findCoffee(menu: Coffee[], id: number): Coffee | undefined {
  return menu.find((c) => c.id === id)
}

// รวมราคาตามรายการ id ที่สั่ง (สั่งซ้ำได้) ถ้ามี id ที่ไม่มีหรือไม่พร้อมขายให้โยน Error
export function orderTotal(menu: Coffee[], ids: number[]): number {
  let total = 0
  for (const id of ids) {
    const coffee = findCoffee(menu, id)
    if (coffee === undefined) throw new Error(`ไม่มีเมนู id ${id}`)
    if (!coffee.available) throw new Error(`${coffee.name} หมดชั่วคราว`)
    total += coffee.price
  }
  return total
}

export function addCoffee(menu: Coffee[], coffee: Coffee): void {
  if (findCoffee(menu, coffee.id) !== undefined) {
    throw new Error(`id ${coffee.id} ซ้ำ`)
  }
  menu.push(coffee)
}

export function removeCoffee(menu: Coffee[], id: number): boolean {
  const index = menu.findIndex((c) => c.id === id)
  if (index === -1) return false
  menu.splice(index, 1)
  return true
}

export function averagePrice(menu: Coffee[]): number {
  if (menu.length === 0) return 0
  const sum = menu.reduce((total, c) => total + c.price, 0)
  return sum / menu.length
}
