"use client"

import { useEffect, useState } from "react"
import { Order, Product } from "@/lib/types"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

interface Zone {
  id: string; name: string; nameAr: string; nameFr: string; rate: number
}
interface Province {
  id: string; name: string; nameAr: string; nameFr: string; zone: string
}

const emptyProduct = (): Partial<Product> => ({
  name: "", description: "", price: 0, originalPrice: 0, image: "", category: "General",
  inStock: true, featured: false,
})

type Tab = "overview" | "orders" | "products" | "homepage" | "delivery"

const COLORS = ["#00f0ff", "#f472b6", "#fbbf24", "#34d399", "#818cf8", "#fb923c"]

export default function AdzakiPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")
  const { lang } = useLang()
  const dir = getDir(lang)

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark" dir={dir}>
        <div className="glass rounded-3xl p-10 w-full max-w-sm cyber-border animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyber/10 border border-cyber/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-500 text-sm mt-1">Enter password to continue</p>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(password === "alpha123")}
            placeholder="Password" className="input-cyber w-full mb-4 text-center" autoFocus />
          <button onClick={() => setAuthed(password === "alpha123")}
            className="btn-cyber-solid w-full py-3">
            Login
          </button>
          {password && password !== "alpha123" && (
            <p className="text-red-400 text-sm text-center mt-3">Wrong password</p>
          )}
        </div>
      </div>
    )
  }

  return <AdminDashboard tab={tab} setTab={setTab} lang={lang} dir={dir} />
}

function AdminDashboard({ tab, setTab, lang, dir }: { tab: Tab; setTab: (t: Tab) => void; lang: string; dir: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [zoneRates, setZoneRates] = useState<Record<string, number>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Product>>(emptyProduct())
  const [saving, setSaving] = useState(false)
  const [orderSearch, setOrderSearch] = useState("")
  const [orderFilter, setOrderFilter] = useState("all")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [rateSaving, setRateSaving] = useState(false)
  const [rateSaved, setRateSaved] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [homepageSettings, setHomepageSettings] = useState({
    heroTitle: "Welcome to",
    heroSubtitle: "Discover premium products curated for quality and style.",
    announcement: "",
    featuredProductIds: [] as string[],
  })
  const [homepageSaved, setHomepageSaved] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [pr, pvr] = await Promise.all([fetch("/api/products"), fetch("/api/provinces")])
      if (pr.ok) { const d = await pr.json(); setProducts(Array.isArray(d) ? d : []) }
      if (pvr.ok) { const d = await pvr.json(); setZones(d.zones || []); setProvinces(d.provinces || []);
        const rates: Record<string, number> = {}; (d.zones || []).forEach((z: Zone) => { rates[z.id] = z.rate }); setZoneRates(rates) }
    } catch {}
  }

  useEffect(() => { loadData() }, [refreshKey])
  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders).catch(() => {})
  }, [refreshKey])

  const triggerRefresh = () => setRefreshKey(k => k + 1)

  const filteredOrders = orders.filter(o => {
    if (orderFilter !== "all" && o.status !== orderFilter) return false
    if (orderSearch) {
      const q = orderSearch.toLowerCase()
      const name = `${o.customer?.firstName || ""} ${o.customer?.lastName || ""}`.toLowerCase()
      const email = (o.customer?.email || "").toLowerCase()
      const phone = (o.customer?.phone || "")
      if (!name.includes(q) && !email.includes(q) && !phone.includes(q)) return false
    }
    return true
  })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[]
  const filteredProducts = products.filter(p => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false
    if (productSearch) {
      const q = productSearch.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !(p.description || "").toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (o.total || 0), 0)
  const confirmedOrders = orders.filter(o => o.status === "confirmed")
  const pendingOrders = orders.filter(o => o.status === "pending")
  const shippedOrders = orders.filter(o => o.status === "shipped")

  // Monthly revenue data (last 6 months)
  const monthlyData = (() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      months[key] = 0
    }
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (months[key] !== undefined) months[key] += o.total || 0
    })
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
  })()

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)
  const topProducts = (() => {
    const counts: Record<string, { name: string; image: string; count: number; revenue: number }> = {}
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      (o.items || []).forEach(item => {
        if (!counts[item.productId]) counts[item.productId] = { name: item.name, image: item.image, count: 0, revenue: 0 }
        counts[item.productId].count += item.quantity
        counts[item.productId].revenue += item.price * item.quantity
      })
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5)
  })()

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(id)
    try {
      const res = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
      if (res.ok) { const data = await res.json(); if (data.orders) setOrders(data.orders) }
    } finally { setUpdatingStatus(null) }
  }

  const handleSaveProduct = async () => {
    setSaving(true)
    try {
      const payload = { ...editForm }
      if (imagePreview && imagePreview.startsWith("data:")) payload.image = imagePreview
      const url = creating ? "/api/products" : `/api/products/${editingProduct?.id}`
      const method = creating ? "POST" : "PUT"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) { const data = await res.json(); if (data.products) setProducts(data.products); cancelEdit(); triggerRefresh() }
      else { alert("Failed to save") }
    } catch { alert("Failed to save") } finally { setSaving(false) }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) { const data = await res.json(); if (data.products) setProducts(data.products); triggerRefresh() }
    } catch { alert("Failed to delete") }
  }

  const cancelEdit = () => { setEditingProduct(null); setCreating(false); setEditForm(emptyProduct()); setImageFile(null); setImagePreview(null) }

  const startEdit = (p: Product) => { setEditingProduct(p); setEditForm({ ...p }); setCreating(false); setImagePreview(p.image) }
  const startCreate = () => { setCreating(true); setEditingProduct(null); setEditForm(emptyProduct()); setImagePreview(null) }

  const updateField = (field: string, value: any) => setEditForm(prev => ({ ...prev, [field]: value }))

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return }
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const saveRates = async () => {
    setRateSaving(true); setRateSaved(false)
    try {
      const res = await fetch("/api/provinces", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ zones: zones.map(z => ({ ...z, rate: zoneRates[z.id] ?? z.rate })) }) })
      if (res.ok) { setRateSaved(true); setTimeout(() => setRateSaved(false), 2000) }
    } finally { setRateSaving(false) }
  }

  const saveHomepage = async () => {
    setHomepageSaved(true)
    try {
      localStorage.setItem("alpha-homepage", JSON.stringify(homepageSettings))
      setTimeout(() => setHomepageSaved(false), 2000)
    } catch {}
  }

  const getZoneName = (z: Zone) => lang === "ar" ? z.nameAr : lang === "fr" ? z.nameFr : z.name
  const getProvinceName = (p: Province) => lang === "ar" ? p.nameAr : lang === "fr" ? p.nameFr : p.name

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key: "orders", label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { key: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { key: "homepage", label: "Homepage", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { key: "delivery", label: "Delivery", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  ]

  return (
    <div className="min-h-screen bg-dark" dir={dir}>
      {/* Top Bar */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyber/10 border border-cyber/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">Alpha<span className="text-cyber">Admin</span></span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" className="text-xs text-gray-500 hover:text-cyber transition-colors px-3 py-1.5 glass rounded-full">
                View Site
              </a>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === t.key ? "border-cyber text-cyber" : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === "overview" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Revenue", value: formatPrice(totalRevenue, lang), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-cyber", bg: "bg-cyber/5", border: "border-cyber/20" },
                { label: "Total Orders", value: orders.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-pink-400", bg: "bg-pink-500/5", border: "border-pink-500/20" },
                { label: "Products", value: products.length, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
                { label: "Pending", value: pendingOrders.length, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/20" },
              ].map((stat, i) => (
                <div key={i} className={`glass rounded-2xl p-6 ${stat.border} border`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-sm">{stat.label}</span>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                      </svg>
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Revenue Overview</h3>
                <div className="flex items-end gap-3 h-48">
                  {monthlyData.map((d, i) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs text-cyber font-bold">{formatPrice(d.revenue, lang)}</span>
                      <div
                        className="w-full rounded-t-lg transition-all duration-1000 relative group cursor-pointer"
                        style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%`, background: `linear-gradient(to top, ${COLORS[i % COLORS.length]}40, ${COLORS[i % COLORS.length]})` }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 rounded-t-lg transition-opacity" />
                      </div>
                      <span className="text-xs text-gray-500">{d.month.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders by Status */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Orders by Status</h3>
                <div className="space-y-4">
                  {[
                    { label: "Confirmed", count: confirmedOrders.length, color: "bg-cyber", pct: orders.length ? (confirmedOrders.length / orders.length) * 100 : 0 },
                    { label: "Pending", count: pendingOrders.length, color: "bg-yellow-400", pct: orders.length ? (pendingOrders.length / orders.length) * 100 : 0 },
                    { label: "Shipped", count: shippedOrders.length, color: "bg-blue-400", pct: orders.length ? (shippedOrders.length / orders.length) * 100 : 0 },
                    { label: "Delivered", count: orders.filter(o => o.status === "delivered").length, color: "bg-green-400", pct: orders.length ? (orders.filter(o => o.status === "delivered").length / orders.length) * 100 : 0 },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{s.label}</span>
                        <span className={`font-bold ${s.color.replace("bg-", "text-")}`}>{s.count}</span>
                      </div>
                      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${s.color}`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            {topProducts.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Top Selling Products</h3>
                <div className="space-y-4">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-4">
                      <span className="w-6 text-center text-sm font-bold text-gray-500">#{i + 1}</span>
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.count} sold</p>
                      </div>
                      <span className="font-bold text-cyber">{formatPrice(p.revenue, lang)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            {orders.length > 0 && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                  <button onClick={() => setTab("orders")} className="text-xs text-cyber hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.02] text-gray-500 uppercase text-xs">
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Items</th>
                        <th className="text-left p-4">Total</th>
                        <th className="text-left p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setTab("orders") }}>
                          <td className="p-4">
                            <p className="font-medium text-gray-200">{order.customer?.firstName} {order.customer?.lastName}</p>
                          </td>
                          <td className="p-4 text-gray-400">{order.items?.length || 0} items</td>
                          <td className="p-4 font-bold text-cyber">{formatPrice(order.total, lang)}</td>
                          <td className="p-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                              order.status === "confirmed" ? "bg-cyber/20 text-cyber border-cyber/30" :
                              order.status === "shipped" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                              order.status === "delivered" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                              order.status === "cancelled" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="animate-fade-in-up">
            {/* Order Detail Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
                <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 glass z-10">
                    <div>
                      <span className="text-sm text-gray-500">Order</span>
                      <span className="font-mono text-cyber font-bold ml-2">#{selectedOrder.id.slice(0, 8)}</span>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-xs text-gray-500 block">Customer</span><span className="text-white font-medium">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</span></div>
                      <div><span className="text-xs text-gray-500 block">Email</span><span className="text-white">{selectedOrder.customer?.email || "-"}</span></div>
                      <div><span className="text-xs text-gray-500 block">Phone</span><span className="text-white">{selectedOrder.customer?.phone || "-"}</span></div>
                      <div><span className="text-xs text-gray-500 block">Province</span><span className="text-white">{selectedOrder.customer?.provinceName || "-"}</span></div>
                      <div className="col-span-2"><span className="text-xs text-gray-500 block">Address</span><span className="text-white">{selectedOrder.customer?.address || "-"}</span></div>
                    </div>
                    <div className="border-t border-white/[0.06] pt-4">
                      <h4 className="text-sm font-bold text-white mb-3">Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item: any) => (
                          <div key={item.productId} className="flex items-center gap-3">
                            <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                            <div className="flex-1"><p className="text-sm text-gray-200">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div>
                            <p className="text-sm font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-white/[0.06] pt-4 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-white">{formatPrice(selectedOrder.subtotal, lang)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="text-white">{formatPrice(selectedOrder.deliveryRate, lang)}</span></div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/[0.06]"><span className="text-white">Total</span><span className="text-cyber">{formatPrice(selectedOrder.total, lang)}</span></div>
                    </div>
                    <div className="border-t border-white/[0.06] pt-4">
                      <h4 className="text-sm font-bold text-white mb-3">Update Status</h4>
                      <div className="flex gap-2 flex-wrap">
                        {["confirmed", "pending", "shipped", "delivered", "cancelled"].map(s => (
                          <button key={s} onClick={() => handleStatusChange(selectedOrder.id, s)}
                            disabled={updatingStatus === selectedOrder.id}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all ${
                              selectedOrder.status === s ? "bg-cyber/20 text-cyber border-cyber/30" : "glass glass-hover text-gray-400 border-white/[0.06]"
                            }`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Header */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Orders</h2>
                  <span className="text-sm text-gray-500">{filteredOrders.length} orders</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search by name, email, or phone..." className="input-cyber flex-1" />
                  <div className="flex gap-2 overflow-x-auto">
                    {["all", "confirmed", "pending", "shipped", "delivered", "cancelled"].map(f => (
                      <button key={f} onClick={() => setOrderFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                          orderFilter === f ? "bg-cyber text-dark" : "glass glass-hover text-gray-400"
                        }`}>{f}</button>
                    ))}
                  </div>
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No orders found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.02] text-gray-500 uppercase text-xs">
                        <th className="text-left p-4">ID</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Items</th>
                        <th className="text-left p-4">Phone</th>
                        <th className="text-left p-4">Total</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</td>
                          <td className="p-4">
                            <p className="font-medium text-gray-200">{order.customer?.firstName} {order.customer?.lastName}</p>
                            <p className="text-gray-500 text-xs">{order.customer?.email}</p>
                          </td>
                          <td className="p-4 text-gray-400">{order.items?.length || 0}</td>
                          <td className="p-4 font-medium text-gray-300">{order.customer?.phone || "-"}</td>
                          <td className="p-4 font-bold text-cyber">{formatPrice(order.total, lang)}</td>
                          <td className="p-4">
                            <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingStatus === order.id}
                              className="glass text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer">
                              {["confirmed", "pending", "shipped", "delivered", "cancelled"].map(s => (
                                <option key={s} value={s} className="bg-dark">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <button onClick={() => setSelectedOrder(order)}
                              className="text-xs text-cyber hover:underline">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="animate-fade-in-up">
            {/* Product Edit/Create Modal */}
            {(editingProduct || creating) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={cancelEdit}>
                <div className="glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 glass z-10">
                    <h3 className="text-lg font-bold text-white">{creating ? "New Product" : "Edit Product"}</h3>
                    <button onClick={cancelEdit} className="text-gray-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Name</label>
                      <input value={editForm.name || ""} onChange={e => updateField("name", e.target.value)} className="input-cyber w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                      <textarea value={editForm.description || ""} onChange={e => updateField("description", e.target.value)} rows={3} className="input-cyber w-full resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Price (DZD)</label>
                        <input type="number" value={editForm.price || 0} onChange={e => updateField("price", parseInt(e.target.value) || 0)} className="input-cyber w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Original Price</label>
                        <input type="number" value={editForm.originalPrice || 0} onChange={e => updateField("originalPrice", parseInt(e.target.value) || 0)} className="input-cyber w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                      <input value={editForm.category || ""} onChange={e => updateField("category", e.target.value)} className="input-cyber w-full" placeholder="General" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Image</label>
                      <div className="flex items-center gap-4">
                        <label className="btn-cyber-solid px-4 py-2 text-sm cursor-pointer">
                          Upload
                          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        </label>
                        <input value={editForm.image || ""} onChange={e => updateField("image", e.target.value)} className="input-cyber flex-1 text-xs" placeholder="Or paste image URL" />
                      </div>
                      {imagePreview && (
                        <img src={imagePreview} alt="" className="w-24 h-24 object-cover rounded-xl mt-3 border border-white/[0.06]" />
                      )}
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editForm.inStock ?? true} onChange={e => updateField("inStock", e.target.checked)} className="w-4 h-4 rounded text-cyber focus:ring-cyber/30 bg-white/[0.05] border-white/[0.2]" />
                        <span className="text-sm text-gray-300">In Stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editForm.featured ?? false} onChange={e => updateField("featured", e.target.checked)} className="w-4 h-4 rounded text-cyber focus:ring-cyber/30 bg-white/[0.05] border-white/[0.2]" />
                        <span className="text-sm text-gray-300">Featured</span>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 border-t border-white/[0.06] flex justify-end gap-3">
                    <button onClick={cancelEdit} className="px-6 py-2 glass glass-hover rounded-full text-sm font-medium text-gray-300">Cancel</button>
                    <button onClick={handleSaveProduct} disabled={saving} className="px-6 py-2 btn-cyber-solid text-sm disabled:opacity-50">{saving ? "Saving..." : creating ? "Create" : "Save"}</button>
                  </div>
                </div>
              </div>
            )}

            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Products</h2>
                  <button onClick={startCreate} className="btn-cyber-solid px-4 py-1.5 text-sm">+ Add Product</button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products..." className="input-cyber flex-1" />
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="input-cyber text-sm">
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No products found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.02] text-gray-500 uppercase text-xs">
                        <th className="text-left p-4">Image</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="p-4"><img src={product.image} alt="" className="w-12 h-12 object-cover rounded-xl" /></td>
                          <td className="p-4"><p className="font-medium text-gray-200">{product.name}</p></td>
                          <td className="p-4"><span className="text-xs bg-white/[0.04] text-gray-400 px-2 py-0.5 rounded-full">{product.category}</span></td>
                          <td className="p-4 font-bold text-cyber">{formatPrice(product.price, lang)}</td>
                          <td className="p-4">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.inStock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {product.inStock ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(product)} className="text-xs text-cyber hover:underline">Edit</button>
                              <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-xs text-red-400 hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "homepage" && (
          <div className="animate-fade-in-up max-w-3xl">
            <div className="glass rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Homepage Settings</h2>
                <button onClick={saveHomepage} className="btn-cyber-solid px-6 py-2 text-sm">
                  {homepageSaved ? "Saved!" : "Save"}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Hero Title</label>
                <input value={homepageSettings.heroTitle} onChange={e => setHomepageSettings(s => ({ ...s, heroTitle: e.target.value }))} className="input-cyber w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Hero Subtitle</label>
                <input value={homepageSettings.heroSubtitle} onChange={e => setHomepageSettings(s => ({ ...s, heroSubtitle: e.target.value }))} className="input-cyber w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Announcement Bar</label>
                <input value={homepageSettings.announcement} onChange={e => setHomepageSettings(s => ({ ...s, announcement: e.target.value }))} className="input-cyber w-full" placeholder="Free shipping over 50,000 DZD" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Featured Products</label>
                <p className="text-xs text-gray-600 mb-2">Select products to feature on homepage</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {products.map(p => (
                    <label key={p.id} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all ${
                      homepageSettings.featuredProductIds.includes(p.id) ? "border-cyber/30 bg-cyber/5" : "border-white/[0.06] hover:border-white/[0.1]"
                    }`}>
                      <input type="checkbox" checked={homepageSettings.featuredProductIds.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) setHomepageSettings(s => ({ ...s, featuredProductIds: [...s.featuredProductIds, p.id] }))
                          else setHomepageSettings(s => ({ ...s, featuredProductIds: s.featuredProductIds.filter(id => id !== p.id) }))
                        }} className="w-4 h-4 rounded text-cyber focus:ring-cyber/30" />
                      <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-lg" />
                      <span className="text-xs text-gray-300 line-clamp-1">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "delivery" && (
          <div className="animate-fade-in-up">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.06]">
                <h2 className="text-xl font-bold text-white">Delivery Rates</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {zones.map(zone => (
                    <div key={zone.id} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-200">{getZoneName(zone)}</span>
                        <span className="text-xs text-gray-500">{provinces.filter(p => p.zone === zone.id).length} regions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={zoneRates[zone.id] ?? zone.rate}
                          onChange={e => setZoneRates(prev => ({ ...prev, [zone.id]: parseInt(e.target.value) || 0 }))}
                          className="input-cyber w-full text-sm py-2" />
                        <span className="text-sm text-gray-500 font-medium w-12">DZD</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {provinces.filter(p => p.zone === zone.id).map(p => (
                          <span key={p.id} className="text-xs bg-white/[0.04] text-gray-400 px-2 py-0.5 rounded-full border border-white/[0.06]">{getProvinceName(p)}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveRates} disabled={rateSaving} className="btn-cyber-solid px-6 py-2 text-sm disabled:opacity-50">
                  {rateSaving ? "Saving..." : rateSaved ? "Saved!" : "Save Rates"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
