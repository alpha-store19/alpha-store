import { NextResponse } from "next/server"
import { getOrders } from "@/lib/orders-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")?.toLowerCase().trim()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const allOrders = getOrders()
  const matched = allOrders.filter(
    (o) => o.customer?.email?.toLowerCase().trim() === email
  )

  return NextResponse.json({ orders: matched })
}
