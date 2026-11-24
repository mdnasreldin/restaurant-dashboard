export type Category = 'Mains' | 'Starters' | 'Desserts' | 'Drinks'

export interface Sale {
  id: number
  date: string // YYYY-MM-DD
  hour: number
  item: string
  category: Category
  qty: number
  total: number
}

const MENU: { item: string; category: Category; price: number }[] = [
  { item: 'Grilled Chicken', category: 'Mains', price: 14.5 },
  { item: 'Beef Burger', category: 'Mains', price: 12 },
  { item: 'Margherita Pizza', category: 'Mains', price: 11 },
  { item: 'Salmon Fillet', category: 'Mains', price: 18 },
  { item: 'Caesar Salad', category: 'Starters', price: 7.5 },
  { item: 'Tomato Soup', category: 'Starters', price: 5.5 },
  { item: 'Garlic Bread', category: 'Starters', price: 4.5 },
  { item: 'Cheesecake', category: 'Desserts', price: 6.5 },
  { item: 'Chocolate Brownie', category: 'Desserts', price: 5.5 },
  { item: 'Fresh Lemonade', category: 'Drinks', price: 3.5 },
  { item: 'Iced Coffee', category: 'Drinks', price: 4 },
  { item: 'Sparkling Water', category: 'Drinks', price: 2.5 },
]

// Small seeded random generator so the sample data is the same on every load.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateSales(days = 90): Sale[] {
  const rand = mulberry32(42)
  const sales: Sale[] = []
  const end = new Date(Date.UTC(2026, 10, 23))
  let id = 1
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(end.getTime() - d * 86400000)
    const weekday = day.getUTCDay()
    const busy = weekday === 5 || weekday === 6 ? 1.5 : 1
    const orders = Math.round((28 + rand() * 14) * busy)
    for (let i = 0; i < orders; i++) {
      const m = MENU[Math.floor(rand() * MENU.length)]
      const lunch = rand() < 0.45
      const hour = lunch ? 12 + Math.floor(rand() * 3) : 18 + Math.floor(rand() * 4)
      const qty = 1 + Math.floor(rand() * 3)
      sales.push({
        id: id++,
        date: day.toISOString().slice(0, 10),
        hour,
        item: m.item,
        category: m.category,
        qty,
        total: Math.round(m.price * qty * 100) / 100,
      })
    }
  }
  return sales
}
