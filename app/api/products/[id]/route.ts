import { NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct, getProducts } from "@/lib/store"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const existing = await getProductById(params.id)
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()
  const updated = await updateProduct(params.id, body)

  return NextResponse.json({ updated, products: await getProducts() })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const existing = await getProductById(params.id)
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await deleteProduct(params.id)
  return NextResponse.json({ products: await getProducts() })
}
