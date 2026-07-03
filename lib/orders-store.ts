import { Order } from "./types"

let orders: Order[] = []

export function getOrders(): Order[] {
  return orders
}

export function addOrder(order: Order): Order {
  const newOrder = {
    ...order,
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
    status: "confirmed" as const,
  }
  orders.unshift(newOrder)
  return newOrder
}

export function updateOrderStatus(id: string, status: string): Order | null {
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) return null
  orders[idx] = { ...orders[idx], status: status as Order["status"] }
  return orders[idx]
}
