import { NextResponse } from "next/server"
import { getProducts, getProductById, getProductsByCategory, addProduct } from "@/lib/store"
import { Product } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const category = searchParams.get("category")

  if (id) {
    const product = await getProductById(id)
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(product)
  }

  if (category) {
    return NextResponse.json(await getProductsByCategory(category))
  }

  return NextResponse.json(await getProducts())
}

export async function POST(request: Request) {
  const body = await request.json()
  const product = await addProduct(body as Product)
  return NextResponse.json({ product, products: await getProducts() }, { status: 201 })
}
