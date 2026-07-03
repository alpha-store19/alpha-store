import { NextResponse } from "next/server"
import { getOrders, addOrder, updateOrderStatus } from "@/lib/orders-store"

export async function GET() {
  return NextResponse.json(getOrders())
}

export async function POST(request: Request) {
  const body = await request.json()
  const order = addOrder(body)
  return NextResponse.json(order, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, status } = body
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
  }
  const updated = updateOrderStatus(id, status)
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  return NextResponse.json({ order: updated, orders: getOrders() })
}
