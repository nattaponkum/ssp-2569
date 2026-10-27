import type { Coffee, CoffeeType } from './coffee.ts'

export class CoffeeMenu {
  #items: Coffee[]

  constructor(items: Coffee[]) {
    this.#items = [...items]
  }

  get count(): number {
    return this.#items.length
  }

  listAvailable(): Coffee[] {
    return this.#items.filter((c) => c.available)
  }

  listByType(type: CoffeeType): Coffee[] {
    return this.#items.filter((c) => c.type === type)
  }

  findById(id: number): Coffee | undefined {
    return this.#items.find((c) => c.id === id)
  }

  add(coffee: Coffee): void {
    if (this.findById(coffee.id) !== undefined) {
      throw new Error(`id ${coffee.id} ซ้ำ`)
    }
    this.#items.push(coffee)
  }

  remove(id: number): boolean {
    const index = this.#items.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.#items.splice(index, 1)
    return true
  }

  orderTotal(ids: number[]): number {
    return ids.reduce((total, id) => {
      const coffee = this.findById(id)
      if (coffee === undefined) throw new Error(`ไม่มีเมนู id ${id}`)
      if (!coffee.available) throw new Error(`${coffee.name} หมดชั่วคราว`)
      return total + coffee.price
    }, 0)
  }

  averagePrice(): number {
    if (this.#items.length === 0) return 0
    return this.#items.reduce((total, c) => total + c.price, 0) / this.#items.length
  }
}
