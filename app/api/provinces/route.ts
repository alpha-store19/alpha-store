import { NextResponse } from "next/server"
import { getZones, getProvinces, updateZoneRate } from "@/lib/provinces"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ zones: getZones(), provinces: getProvinces() })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { zoneId, rate } = body
  if (!zoneId || typeof rate !== "number") {
    return NextResponse.json({ error: "Missing zoneId or rate" }, { status: 400 })
  }
  const ok = updateZoneRate(zoneId, rate)
  if (!ok) return NextResponse.json({ error: "Zone not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
