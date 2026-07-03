import { NextResponse } from "next/server"
import { getProducts, getProductById, getProductsByCategory } from "@/lib/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const category = searchParams.get("category")

  if (id) {
    const product = getProductById(id)
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(product)
  }

  if (category) {
    return NextResponse.json(getProductsByCategory(category))
  }

  return NextResponse.json(getProducts())
}
