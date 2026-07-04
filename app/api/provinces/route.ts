import { NextResponse } from "next/server"
import { getProvinces, updateProvinceRate } from "@/lib/provinces"
import { rateLimitIP } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ provinces: await getProvinces() })
}

export async function PUT(request: Request) {
  try {
    const rl = rateLimitIP(request, 20, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const { provinceId, rate } = body

    if (!provinceId || typeof rate !== "number") {
      return NextResponse.json({ error: "Missing provinceId or rate" }, { status: 400 })
    }

    const safeRate = Math.max(0, Math.min(99999, Math.round(rate)))

    const ok = await updateProvinceRate(provinceId, safeRate)
    if (!ok) return NextResponse.json({ error: "Province not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}