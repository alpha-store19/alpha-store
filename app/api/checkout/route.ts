import { NextResponse } from "next/server"
import { addOrder } from "@/lib/orders-store"
import { getProductById, updateProduct, getProducts } from "@/lib/store"
import { rateLimitIP } from "@/lib/rate-limit"
import nodemailer from "nodemailer"

const ADMIN_EMAIL = "alphazaki209@gmail.com"

function buildEmailHtml(order: any, customer: any) {
  const itemsHtml = order.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">DZD ${Math.round(item.price).toLocaleString()}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">DZD ${Math.round(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#1a1a2e,#00f0ff);padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">New Order Received</h1>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #eee;border-radius:0 0 12px 12px">
        <h2 style="color:#1a1a2e;font-size:18px;margin-top:0">Order #${order.id.slice(0, 8)}</h2>
        <h3 style="color:#1a1a2e;font-size:14px;border-bottom:2px solid #00f0ff;padding-bottom:5px">Customer Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:4px;color:#666">Name</td><td style="padding:4px;font-weight:bold">${customer.firstName} ${customer.lastName}</td></tr>
          <tr><td style="padding:4px;color:#666">Phone</td><td style="padding:4px;font-weight:bold">${customer.phone}</td></tr>
          <tr><td style="padding:4px;color:#666">Email</td><td style="padding:4px;font-weight:bold">${customer.email}</td></tr>
          <tr><td style="padding:4px;color:#666">Province</td><td style="padding:4px;font-weight:bold">${customer.provinceName}</td></tr>
          <tr><td style="padding:4px;color:#666">Address</td><td style="padding:4px;font-weight:bold">${customer.address}</td></tr>
        </table>
        <h3 style="color:#1a1a2e;font-size:14px;border-bottom:2px solid #00f0ff;padding-bottom:5px;margin-top:16px">Order Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-top:16px;border-top:2px solid #1a1a2e;padding-top:10px;text-align:right;font-size:16px">
          <strong>Subtotal: DZD ${Math.round(order.subtotal).toLocaleString()}</strong><br/>
          <span style="font-size:13px;color:#666">Delivery: DZD ${Math.round(customer.deliveryRate).toLocaleString()}</span><br/>
          <span style="font-size:20px;color:#00f0ff">Total: DZD ${Math.round(order.total).toLocaleString()}</span>
        </div>
        <p style="margin-top:20px;font-size:11px;color:#999;text-align:center">Alpha Store â€” Order Notification</p>
      </div>
    </body>
    </html>`
}

function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, "").trim()
}

export async function POST(request: Request) {
  try {
    const rl = rateLimitIP(request, 10, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const { items, customer, subtotal, total, deliveryRate } = body

    if (!items?.length || !customer) {
      return NextResponse.json({ error: "Missing items or customer" }, { status: 400 })
    }

    for (const item of items) {
      if (!item.productId || !item.name || typeof item.price !== "number" || !item.quantity || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 })
      }
      if (item.price < 0 || item.price > 99999999) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 })
      }
    }

    // Validate stock for all items
    for (const item of items) {
      const product = await getProductById(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product "${item.name}" not found` }, { status: 400 })
      }
      if (product.quantity <= 0) {
        return NextResponse.json({ error: `"${product.name}" is out of stock` }, { status: 400 })
      }
      if (item.quantity > product.quantity) {
        return NextResponse.json({ error: `Not enough "${product.name}" in stock. Available: ${product.quantity}` }, { status: 400 })
      }
    }

    if (!customer.firstName || !customer.lastName || !customer.phone || !customer.email || !customer.address) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 })
    }

    const safeCustomer = {
      firstName: sanitize(customer.firstName).slice(0, 50),
      lastName: sanitize(customer.lastName).slice(0, 50),
      phone: customer.phone.replace(/[^0-9+\-\s]/g, "").slice(0, 20),
      email: customer.email.replace(/[^a-zA-Z0-9@._\-]/g, "").slice(0, 100),
      address: sanitize(customer.address).slice(0, 200),
      province: sanitize(customer.province || ""),
      provinceName: sanitize(customer.provinceName || ""),
      deliveryRate: Math.max(0, Math.min(99999, deliveryRate || 0)),
    }

    const calculatedTotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)
    if (Math.abs((total || calculatedTotal) - calculatedTotal) > 10000) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 })
    }

    const order = addOrder({
      id: "",
      items,
      subtotal: calculatedTotal,
      total: calculatedTotal + safeCustomer.deliveryRate,
      deliveryRate: safeCustomer.deliveryRate,
      customer: safeCustomer,
      status: "confirmed",
      createdAt: "",
    })

    // Deduct stock
    for (const item of items) {
      const product = await getProductById(item.productId)
      if (product) {
        await updateProduct(item.productId, { quantity: Math.max(0, product.quantity - item.quantity) })
      }
    }

    try {
      if (process.env.GMAIL_APP_PASSWORD) {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.GMAIL_USER || ADMIN_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        })
        await transporter.sendMail({
          from: `"Alpha Store" <${process.env.GMAIL_USER || ADMIN_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `New Order #${order.id.slice(0, 8)} â€” ${safeCustomer.firstName} ${safeCustomer.lastName}`,
          html: buildEmailHtml({ ...order, items, subtotal: calculatedTotal, total: calculatedTotal + safeCustomer.deliveryRate }, safeCustomer),
        })
      }
    } catch (err) {
      console.error("Email send failed:", err)
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 })
  }
}