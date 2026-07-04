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
    const { provinceId, rateHome, rateOffice } = body

    if (!provinceId || typeof rateHome !== "number" || typeof rateOffice !== "number") {
      return NextResponse.json({ error: "Missing provinceId, rateHome, or rateOffice" }, { status: 400 })
    }

    const safeHome = Math.max(0, Math.min(99999, Math.round(rateHome)))
    const safeOffice = Math.max(0, Math.min(99999, Math.round(rateOffice)))

    const ok = await updateProvinceRate(provinceId, safeHome, safeOffice)
    if (!ok) return NextResponse.json({ error: "Province not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}