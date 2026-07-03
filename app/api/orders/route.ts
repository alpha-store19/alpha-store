import { NextResponse } from "next/server"
import { Order } from "@/lib/types"

const orders: Order[] = []

export async function GET() {
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const body = await request.json()
  const order: Order = {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    ...body,
    createdAt: new Date().toISOString(),
  }
  orders.unshift(order)
  return NextResponse.json(order, { status: 201 })
}
