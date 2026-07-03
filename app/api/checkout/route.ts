import { NextResponse } from "next/server"
import { addOrder } from "@/lib/orders-store"

export async function POST(request: Request) {
  const body = await request.json()
  const { items, customer, subtotal, total, deliveryRate } = body

  if (!items?.length || !customer) {
    return NextResponse.json({ error: "Missing items or customer" }, { status: 400 })
  }

  const order = addOrder({
    id: "",
    items,
    subtotal,
    total: total || items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0),
    deliveryRate,
    customer,
    status: "confirmed",
    createdAt: "",
  })

  return NextResponse.json(order, { status: 201 })
}
