import { NextResponse } from "next/server"
import { getOrders, updateOrderStatus } from "@/lib/orders-store"
import { rateLimitIP } from "@/lib/rate-limit"

const validStatuses = ["confirmed", "pending", "shipped", "delivered", "cancelled"]

export async function GET() {
  return NextResponse.json(getOrders())
}

export async function PATCH(request: Request) {
  try {
    const rl = rateLimitIP(request, 30, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    if (typeof id !== "string" || id.length > 100) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const updated = updateOrderStatus(id, status)
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: updated, orders: getOrders() })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
