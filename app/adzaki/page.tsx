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
  name: "", description: "", price: 0, image: "", category: "General",
  inStock: true, featured: false,
})

export default function AdzakiPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Product>>(emptyProduct())
  const [refreshKey, setRefreshKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [zones, setZones] = useState<Zone[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [zoneRates, setZoneRates] = useState<Record<string, number>>({})
  const [rateSaving, setRateSaving] = useState(false)
  const [rateSaved, setRateSaved] = useState(false)
  const [orderFilter, setOrderFilter] = useState<string>("all")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const { lang } = useLang()
  const dir = getDir(lang)

  const loadData = async () => {
    try {
      const [productsRes, provincesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/provinces"),
      ])
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(Array.isArray(data) ? data : [])
      }
      if (provincesRes.ok) {
        const data = await provincesRes.json()
        setZones(data.zones || [])
        setProvinces(data.provinces || [])
        const rates: Record<string, number> = {}
        ;(data.zones || []).forEach((zone: Zone) => { rates[zone.id] = zone.rate })
        setZoneRates(rates)
      }
    } catch {}
  }

  useEffect(() => { loadData() }, [refreshKey])

  useEffect(() => {
    if (authed) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then(setOrders)
        .catch(() => {})
    }
  }, [authed, refreshKey])

  const handleLogin = () => {
    if (password === "alpha123") { setAuthed(true) }
    else { alert("Wrong password") }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setEditForm({ ...product })
    setCreating(false)
  }

  const startCreate = () => {
    setCreating(true)
    setEditingProduct(null)
    setEditForm(emptyProduct())
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setCreating(false)
    setEditForm(emptyProduct())
  }

  const handleSave = async () => {
    if (!editingProduct) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.products) setProducts(data.products)
        setEditingProduct(null)
        setEditForm(emptyProduct())
      }
    } catch {
      alert("Failed to save")
    } finally { setSaving(false) }
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.products) setProducts(data.products)
        setCreating(false)
        setEditForm(emptyProduct())
      }
    } catch {
      alert("Failed to create")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        const data = await res.json()
        if (data.products) setProducts(data.products)
      }
    } catch {
      alert("Failed to delete")
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(id)
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.orders) setOrders(data.orders)
      }
    } catch {} finally { setUpdatingStatus(null) }
  }

  const saveRates = async () => {
    setRateSaving(true); setRateSaved(false)
    try {
      for (const [zoneId, rate] of Object.entries(zoneRates)) {
        await fetch("/api/provinces", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zoneId, rate }),
        })
      }
      setRateSaved(true)
      setTimeout(() => setRateSaved(false), 2000)
    } catch { alert("Failed to save rates") }
    finally { setRateSaving(false) }
  }

  const updateField = (field: string, value: string | number | boolean | undefined) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const getZoneName = (zone: Zone) => {
    if (lang === "ar") return zone.nameAr
    if (lang === "fr") return zone.nameFr
    return zone.name
  }
  const getProvinceName = (p: Province) => {
    if (lang === "ar") return p.nameAr
    if (lang === "fr") return p.nameFr
    return p.name
  }

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter)
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 outline-none transition-all text-sm"

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center" dir={dir}>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("admin.access", lang)}</h1>
        <p className="text-gray-500 mb-6">{t("admin.access.desc", lang)}</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder={t("admin.password", lang)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 outline-none transition-all mb-4 text-center" />
        <button onClick={handleLogin}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full font-semibold transition-all">
          {t("admin.login", lang)}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("admin.title", lang)}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-4xl font-bold text-gray-900">{products.length}</p>
          <p className="text-gray-500 mt-1">{t("admin.totalProducts", lang)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-4xl font-bold text-[#e94560]">{orders.length}</p>
          <p className="text-gray-500 mt-1">{t("admin.totalOrders", lang)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-4xl font-bold text-blue-600">{orders.filter((o) => o.status === "confirmed").length}</p>
          <p className="text-gray-500 mt-1">Confirmed</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-4xl font-bold text-green-600">{formatPrice(totalRevenue, lang)}</p>
          <p className="text-gray-500 mt-1">{t("admin.totalRevenue", lang)}</p>
        </div>
      </div>

      {/* Delivery Rates */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{t("admin.delivery.title", lang)}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{getZoneName(zone)}</span>
                  <span className="text-xs text-gray-400">
                    {provinces.filter((p) => p.zone === zone.id).length} {t("admin.products.items", lang)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={zoneRates[zone.id] ?? zone.rate}
                    onChange={(e) => setZoneRates((prev) => ({ ...prev, [zone.id]: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 outline-none text-sm" />
                  <span className="text-sm text-gray-500 font-medium w-12">DZD</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {provinces.filter((p) => p.zone === zone.id).map((p) => (
                    <span key={p.id} className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {getProvinceName(p)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={saveRates} disabled={rateSaving}
            className="bg-[#e94560] hover:bg-[#ff6b81] disabled:bg-gray-400 text-white px-6 py-2 rounded-full font-medium text-sm transition-all">
            {rateSaving ? t("admin.saving", lang) : rateSaved ? t("admin.delivery.saved", lang) : t("admin.delivery.save", lang)}
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t("admin.products", lang)}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{products.length} {t("admin.products.items", lang)}</span>
            <button onClick={startCreate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all">
              + Add Product
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                <th className="text-left p-4">{t("admin.products", lang)}</th>
                <th className="text-left p-4">{t("admin.products.category", lang)}</th>
                <th className="text-left p-4">{t("admin.products.price", lang)}</th>
                <th className="text-left p-4">{t("admin.products.inStock", lang)}</th>
                <th className="text-left p-4">{t("admin.products.featured", lang)}</th>
                <th className="text-right p-4">{t("admin.edit", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                      <span className="font-medium line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{product.category}</td>
                  <td className="p-4 font-bold">{formatPrice(product.price, lang)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.inStock ? t("admin.products.inStock", lang) : t("product.outOfStock", lang)}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.featured ? <span className="text-yellow-500 text-lg">&#9733;</span> : <span className="text-gray-300 text-lg">&#9733;</span>}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(product)}
                      className="text-blue-500 hover:text-blue-600 font-medium mr-3 transition-colors">{t("admin.edit", lang)}</button>
                    <button onClick={() => handleDelete(product.id, product.name)}
                      className="text-red-500 hover:text-red-600 font-medium transition-colors">{t("admin.delete", lang)}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {(editingProduct || creating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {creating ? "Add Product" : t("admin.products.edit", lang)}
              </h3>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex gap-3 items-start">
                  {editForm.image && <img src={editForm.image} alt="" className="w-16 h-16 object-cover rounded-xl shrink-0" />}
                  <div className="flex-1 space-y-2">
                    <input value={editForm.image || ""} onChange={(e) => updateField("image", e.target.value)}
                      placeholder="Image URL..." className={inputClass} />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">or</span>
                      <label className="cursor-pointer text-xs text-[#e94560] hover:text-[#ff6b81] font-medium underline">
                        Upload from device
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return }
                          const reader = new FileReader()
                          reader.onload = () => updateField("image", reader.result as string)
                          reader.readAsDataURL(file)
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.products.name", lang)}</label>
                <input value={editForm.name || ""} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.products.description", lang)}</label>
                <textarea value={editForm.description || ""} onChange={(e) => updateField("description", e.target.value)}
                  rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 outline-none transition-all text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.products.price", lang)}</label>
                  <input type="number" value={editForm.price || 0}
                    onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.products.originalPrice", lang)}</label>
                  <input type="number" value={editForm.originalPrice ?? ""}
                    onChange={(e) => updateField("originalPrice", e.target.value ? parseFloat(e.target.value) : undefined)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.products.category", lang)}</label>
                <input value={editForm.category || ""} onChange={(e) => updateField("category", e.target.value)} className={inputClass} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.inStock ?? true}
                    onChange={(e) => updateField("inStock", e.target.checked)}
                    className="w-4 h-4 text-[#e94560] rounded border-gray-300 focus:ring-[#e94560]" />
                  <span className="text-sm text-gray-700">{t("admin.products.inStock", lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.featured ?? false}
                    onChange={(e) => updateField("featured", e.target.checked)}
                    className="w-4 h-4 text-[#e94560] rounded border-gray-300 focus:ring-[#e94560]" />
                  <span className="text-sm text-gray-700">{t("admin.products.featured", lang)}</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={cancelEdit}
                className="px-6 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                {t("admin.cancel", lang)}
              </button>
              <button onClick={creating ? handleCreate : handleSave} disabled={saving}
                className="px-6 py-2 bg-[#e94560] hover:bg-[#ff6b81] disabled:bg-gray-400 text-white rounded-full text-sm font-medium transition-all">
                {saving ? t("admin.saving", lang) : creating ? "Create" : t("admin.save", lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("admin.orders", lang)}</h2>
          <div className="flex flex-wrap gap-2">
            {["all", "confirmed", "pending", "shipped", "delivered", "cancelled"].map((f) => (
              <button key={f} onClick={() => setOrderFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  orderFilter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>{t("admin.noOrders", lang)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">{t("admin.products", lang)}</th>
                  <th className="text-left p-4">{t("cart.summary", lang)}</th>
                  <th className="text-left p-4">{t("checkout.phone", lang)}</th>
                  <th className="text-left p-4">{t("checkout.province", lang)}</th>
                  <th className="text-left p-4">{t("cart.total", lang)}</th>
                  <th className="text-left p-4">{t("admin.orders", lang)}</th>
                  <th className="text-left p-4">{t("admin.delivery.title", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                      <p className="text-gray-400 text-xs">{order.customer?.email}</p>
                    </td>
                    <td className="p-4">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</td>
                    <td className="p-4 font-medium">{order.customer?.phone || "-"}</td>
                    <td className="p-4">{order.customer?.provinceName || "-"}</td>
                    <td className="p-4 font-bold">{formatPrice(order.total, lang)}</td>
                    <td className="p-4">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
