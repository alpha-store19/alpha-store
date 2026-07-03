"use client"

import { useState } from "react"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

interface OrderItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  subtotal: number
  total: number
  deliveryRate: number
  customer: {
    firstName: string
    lastName: string
    phone: string
    email: string
    province: string
    provinceName: string
    address: string
  }
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  confirmed: "bg-cyber/20 text-cyber border-cyber/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function DashboardPage() {
  const [email, setEmail] = useState("")
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { lang } = useLang()
  const dir = getDir(lang)

  const searchOrders = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/orders/lookup?email=${encodeURIComponent(email.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      } else {
        setOrders([])
      }
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyber/10 border border-cyber/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Track Your Orders</h1>
        <p className="text-gray-400">Enter your email to see your order history</p>
      </div>

      <form onSubmit={searchOrders} className="max-w-md mx-auto mb-12 animate-fade-in-up">
        <div className="flex gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-cyber flex-1"
          />
          <button type="submit" disabled={loading} className="btn-cyber-solid px-6 py-2.5 disabled:opacity-50">
            {loading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {searched && !loading && orders?.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl animate-fade-in-up">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-lg">No orders found for this email.</p>
          <p className="text-gray-600 text-sm mt-1">Check the email you used at checkout.</p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          {orders.map((order) => (
            <div key={order.id} className="glass rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Order</span>
                  <span className="font-mono text-cyber font-bold ml-2">#{order.id.slice(0, 8)}</span>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${statusColors[order.status] || "glass"}`}>
                  {order.status}
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-white font-medium">{formatPrice(order.subtotal, lang)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-white">{formatPrice(order.deliveryRate, lang)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/[0.06]">
                    <span className="text-white">Total</span>
                    <span className="text-cyber">{formatPrice(order.total, lang)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-gray-500 flex items-center justify-between">
                  <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
