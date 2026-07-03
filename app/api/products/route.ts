import { NextResponse } from "next/server"
import { getProducts, getProductById, getProductsByCategory, addProduct } from "@/lib/store"
import { Product } from "@/lib/types"

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

export async function POST(request: Request) {
  const body = await request.json()
  const product = addProduct(body as Product)
  return NextResponse.json({ product, products: getProducts() }, { status: 201 })
}
