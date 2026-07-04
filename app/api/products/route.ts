import { NextResponse } from "next/server"
import { getProducts, getProductById, getProductsByCategory, addProduct } from "@/lib/store"
import { Product } from "@/lib/types"

function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, "").trim()
}

function validateProduct(body: any): { valid: boolean; error?: string; data?: Partial<Product> } {
  if (!body.name || typeof body.name !== "string" || body.name.length > 200) {
    return { valid: false, error: "Invalid name" }
  }
  if (typeof body.price !== "number" || body.price < 0 || body.price > 99999999) {
    return { valid: false, error: "Invalid price" }
  }
  if (body.image && typeof body.image === "string" && body.image.length > 500000) {
    return { valid: false, error: "Image too large" }
  }

  return {
    valid: true,
    data: {
      name: sanitize(body.name).slice(0, 200),
      description: sanitize(body.description || "").slice(0, 2000),
      price: Math.round(body.price),
      originalPrice: body.originalPrice ? Math.round(Math.max(0, body.originalPrice)) : undefined,
      image: typeof body.image === "string" ? body.image.slice(0, 500000) : "",
      category: sanitize(body.category || "General").slice(0, 50),
      quantity: typeof body.quantity === "number" ? Math.max(0, Math.round(body.quantity)) : 999,
      featured: body.featured === true,
      freeShipping: body.freeShipping === true,
    },
  }
}

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
  try {
    const body = await request.json()
    const validation = validateProduct(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const product = await addProduct(validation.data as Product)
    return NextResponse.json({ product, products: await getProducts() }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
