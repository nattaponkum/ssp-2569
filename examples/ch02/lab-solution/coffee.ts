export type CoffeeType = 'hot' | 'iced' | 'frappe'

export interface Coffee {
  id: number
  name: string
  price: number
  type: CoffeeType
  available: boolean
}

export const initialMenu: Coffee[] = [
  { id: 1, name: 'Espresso', price: 50, type: 'hot', available: true },
  { id: 2, name: 'Latte', price: 65, type: 'iced', available: true },
  { id: 3, name: 'Mocha', price: 70, type: 'frappe', available: false },
  { id: 4, name: 'Americano', price: 55, type: 'iced', available: true },
  { id: 5, name: 'Cappuccino', price: 60, type: 'hot', available: true },
]
