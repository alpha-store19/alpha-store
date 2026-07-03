import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { items, customer } = body

  if (!items?.length || !customer) {
    return NextResponse.json({ error: "Missing items or customer" }, { status: 400 })
  }

  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => {
    return sum + item.price * item.quantity
  }, 0)

  const order = {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    items,
    total,
    customer,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(order, { status: 201 })
}
