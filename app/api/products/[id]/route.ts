import { NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct, getProducts } from "@/lib/store"

function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, "").trim()
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getProductById(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()

    // Validate and sanitize
    const safe: Record<string, any> = {}
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.length > 200) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 })
      }
      safe.name = sanitize(body.name).slice(0, 200)
    }
    if (body.price !== undefined) {
      if (typeof body.price !== "number" || body.price < 0 || body.price > 99999999) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 })
      }
      safe.price = Math.round(body.price)
    }
    if (body.description !== undefined) {
      safe.description = sanitize(String(body.description)).slice(0, 2000)
    }
    if (body.image !== undefined) {
      if (typeof body.image !== "string" || body.image.length > 500000) {
        return NextResponse.json({ error: "Invalid image" }, { status: 400 })
      }
      safe.image = body.image
    }
    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length > 20) {
        return NextResponse.json({ error: "Invalid images array" }, { status: 400 })
      }
      safe.images = body.images.filter((s: any) => typeof s === "string" && s.length <= 500000)
    }
    if (body.category !== undefined) {
      safe.category = sanitize(String(body.category)).slice(0, 50)
    }
    if (body.quantity !== undefined) {
      if (typeof body.quantity !== "number" || body.quantity < 0 || body.quantity > 999999) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
      }
      safe.quantity = Math.round(body.quantity)
    }
    if (body.freeShipping !== undefined) {
      safe.freeShipping = body.freeShipping === true
    }
    if (body.featured !== undefined) {
      safe.featured = body.featured === true
    }
    if (body.originalPrice !== undefined) {
      safe.originalPrice = Math.round(Math.max(0, body.originalPrice))
    }

    const updated = await updateProduct(params.id, safe)
    return NextResponse.json({ updated, products: await getProducts() })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getProductById(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await deleteProduct(params.id)
    return NextResponse.json({ products: await getProducts() })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
