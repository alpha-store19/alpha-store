"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Order, Product } from "@/lib/types"
import { useLang } from "@/lib/language-context"
import { t, getDir, Lang } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

interface Province { id: string; name: string; nameAr: string; nameFr: string; rateHome: number; rateOffice: number }

const emptyProduct = (): Partial<Product> => ({
  name: "", description: "", price: 0, originalPrice: 0, image: "", images: [], category: "General",
  quantity: 999, featured: false, freeShipping: false,
})

const STATUSES = ["confirmed", "pending", "shipped", "delivered", "cancelled"] as const
const COLORS = ["#00f0ff", "#f472b6", "#fbbf24", "#34d399", "#818cf8", "#fb923c"]

function cn(...classes: (string | boolean | undefined | null)[]) { return classes.filter(Boolean).join(" ") }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function AdzakiPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState("overview")
  const { lang } = useLang()
  const dir = getDir(lang)

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark" dir={dir}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber/20 via-transparent to-cyber/20 blur-3xl opacity-30" />
          <div className="relative glass rounded-3xl p-10 w-full max-w-sm cyber-border animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-cyber/20 to-cyber/5 border border-cyber/20 flex items-center justify-center animate-pulse-glow">
                <svg className="w-10 h-10 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Alpha Admin</h1>
              <p className="text-gray-500 text-sm">Enter password to continue</p>
            </div>
            <div className="space-y-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setAuthed(password === "adminzaki")}
                placeholder="Password" className="input-cyber w-full text-center" autoFocus />
              <button onClick={() => setAuthed(password === "adminzaki")} className="btn-cyber-solid w-full py-3 text-sm tracking-wider">UNLOCK</button>
              {password && password !== "adminzaki" && (
                <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  Wrong password
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return <AdminDashboard tab={tab} setTab={setTab} lang={lang} dir={dir} />
}

const sidebarTabs = [
  { key: "overview", label: "Overview", labelAr: "نظرة عامة", labelFr: "Aperçu", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "orders", label: "Orders", labelAr: "الطلبات", labelFr: "Commandes", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "products", label: "Products", labelAr: "المنتجات", labelFr: "Produits", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { key: "analytics", label: "Analytics", labelAr: "التحليلات", labelFr: "Analytique", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "settings", label: "Settings", labelAr: "الإعدادات", labelFr: "Paramètres", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
]

function AdminDashboard({ tab, setTab, lang, dir }: { tab: string; setTab: (t: string) => void; lang: Lang; dir: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provinceRates, setProvinceRates] = useState<Record<string, { home: number; office: number }>>({})
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [orderSort, setOrderSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" })
  const [orderPage, setOrderPage] = useState(1)
  const [productPage, setProductPage] = useState(1)
  const [productView, setProductView] = useState<"grid" | "list">("grid")
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [homepageSettings, setHomepageSettings] = useState({ heroTitle: "Welcome to", heroSubtitle: "Discover premium products curated for quality and style.", announcement: "", featuredProductIds: [] as string[] })
  const [homepageSaved, setHomepageSaved] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const PER_PAGE = 15

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const authHeaders = useMemo(() => ({ "Content-Type": "application/json", authorization: "Bearer alpha123" }), [])

  const loadData = useCallback(async () => {
    try {
      const [pr, pvr] = await Promise.all([fetch("/api/products"), fetch("/api/provinces")])
      if (pr.ok) { const d = await pr.json(); setProducts(Array.isArray(d) ? d : []) }
      if (pvr.ok) { const d = await pvr.json(); setProvinces(d.provinces || []);
        const rates: Record<string, { home: number; office: number }> = {}; (d.provinces || []).forEach((p: Province) => { rates[p.id] = { home: p.rateHome, office: p.rateOffice } }); setProvinceRates(rates) }
    } catch {}
  }, [])

  useEffect(() => { loadData() }, [refreshKey, loadData])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders")
        if (res.ok) {
          const data: Order[] = await res.json()
          setOrders(prev => {
            if (data.length > prev.length) setNewOrderCount(c => c + (data.length - prev.length))
            return data
          })
        }
      } catch {}
    }
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const triggerRefresh = () => setRefreshKey(k => k + 1)

  const filteredOrders = useMemo(() => {
    let result = [...orders]
    if (orderFilter !== "all") result = result.filter(o => o.status === orderFilter)
    if (orderSearch) { const q = orderSearch.toLowerCase(); result = result.filter(o =>
      `${o.customer?.firstName || ""} ${o.customer?.lastName || ""}`.toLowerCase().includes(q) ||
      (o.customer?.email || "").toLowerCase().includes(q) || (o.customer?.phone || "").includes(q) || o.id?.toLowerCase().includes(q)) }
    if (dateFrom) { const d = new Date(dateFrom); result = result.filter(o => new Date(o.createdAt) >= d) }
    if (dateTo) { const d = new Date(dateTo); d.setHours(23, 59, 59); result = result.filter(o => new Date(o.createdAt) <= d) }
    result.sort((a, b) => {
      const av = orderSort.key === "total" ? (a.total || 0) : orderSort.key === "createdAt" ? new Date(a.createdAt).getTime() : (a.customer?.firstName || "")
      const bv = orderSort.key === "total" ? (b.total || 0) : orderSort.key === "createdAt" ? new Date(b.createdAt).getTime() : (b.customer?.firstName || "")
      return orderSort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return result
  }, [orders, orderFilter, orderSearch, dateFrom, dateTo, orderSort])

  const totalPages = Math.ceil(filteredOrders.length / PER_PAGE)
  const pagedOrders = filteredOrders.slice((orderPage - 1) * PER_PAGE, orderPage * PER_PAGE)
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[], [products])
  const filteredProducts = useMemo(() => {
    let r = [...products]
    if (categoryFilter !== "all") r = r.filter(p => p.category === categoryFilter)
    if (productSearch) { const q = productSearch.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)) }
    return r
  }, [products, categoryFilter, productSearch])
  const productPages = Math.ceil(filteredProducts.length / PER_PAGE)

  const totalRevenue = useMemo(() => orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0), [orders])
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === "confirmed"), [orders])
  const pendingOrders = useMemo(() => orders.filter(o => o.status === "pending"), [orders])
  const shippedOrders = useMemo(() => orders.filter(o => o.status === "shipped"), [orders])
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === "delivered"), [orders])
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === "cancelled"), [orders])

  const prevMonthRevenue = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return orders.filter(o => o.status !== "cancelled" && new Date(o.createdAt) < cutoff).reduce((s, o) => s + (o.total || 0), 0)
  }, [orders])

  const revenueTrend = prevMonthRevenue > 0 ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

  const toggleOrderSort = (key: string) => setOrderSort(p => ({ key, dir: p.key === key && p.dir === "desc" ? "asc" : "desc" }))

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0 }
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const d = new Date(o.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (months[key] !== undefined) months[key] += o.total || 0
    })
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
  }, [orders])
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)

  const monthlyOrders = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0 }
    orders.forEach(o => {
      const d = new Date(o.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (months[key] !== undefined) months[key]++
    })
    return Object.entries(months).map(([month, count]) => ({ month, count }))
  }, [orders])

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; image: string; count: number; revenue: number }> = {}
    orders.filter(o => o.status !== "cancelled").forEach(o => (o.items || []).forEach(item => {
      if (!counts[item.productId]) counts[item.productId] = { name: item.name, image: item.image, count: 0, revenue: 0 }
      counts[item.productId].count += item.quantity; counts[item.productId].revenue += item.price * item.quantity
    }))
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [orders])

  const salesByCategory = useMemo(() => {
    const cats: Record<string, number> = {}
    orders.filter(o => o.status !== "cancelled").forEach(o => (o.items || []).forEach(item => {
      const p = products.find(pr => pr.id === item.productId)
      const cat = p?.category || "Other"
      cats[cat] = (cats[cat] || 0) + item.price * item.quantity
    }))
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [orders, products])

  const sorter = (key: string) => (
    <span className="inline-flex flex-col ml-1 -mt-0.5 align-middle cursor-pointer opacity-40 hover:opacity-100" onClick={() => toggleOrderSort(key)}>
      <svg className={`w-3 h-3 ${orderSort.key === key && orderSort.dir === "asc" ? "text-cyber" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M3 12l7-8 7 8H3z" /></svg>
      <svg className={`w-3 h-3 -mt-1 ${orderSort.key === key && orderSort.dir === "desc" ? "text-cyber" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M3 4l7 8 7-8H3z" /></svg>
    </span>
  )

  const statusBadge = (status: string, size: "sm" | "md" = "sm") => {
    const config: Record<string, { bg: string; text: string; border: string; dot: string }> = {
      confirmed: { bg: "bg-cyber/15", text: "text-cyber", border: "border-cyber/25", dot: "bg-cyber" },
      pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/25", dot: "bg-yellow-400" },
      shipped: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25", dot: "bg-blue-400" },
      delivered: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/25", dot: "bg-green-400" },
      cancelled: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/25", dot: "bg-red-400" },
    }
    const c = config[status] || config.pending
    const p = size === "md" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${c.bg} ${c.text} ${c.border} ${p} capitalize`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {status}
      </span>
    )
  }

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(id)
    try {
      const res = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
      if (res.ok) { const data = await res.json(); if (data.orders) setOrders(data.orders); showToast(`Order ${status}`) }
      else showToast("Failed", "error")
    } catch { showToast("Failed", "error") } finally { setUpdatingStatus(null) }
  }

  const handleBulkStatus = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return
    const ids = Array.from(selectedOrders); for (let i = 0; i < ids.length; i++) { await handleStatusChange(ids[i], bulkStatus) }
    setSelectedOrders(new Set()); setBulkStatus(""); showToast(`${selectedOrders.size} orders updated`)
  }

  const exportCSV = () => {
    const headers = ["ID", "Customer", "Email", "Phone", "Items", "Total", "Status", "Date", "Province"]
    const rows = filteredOrders.map(o => [
      o.id.slice(0, 8), `${o.customer?.firstName || ""} ${o.customer?.lastName || ""}`,
      o.customer?.email || "", o.customer?.phone || "", o.items?.length || 0,
      o.total || 0, o.status, new Date(o.createdAt).toISOString(), o.customer?.provinceName || ""
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url); showToast("CSV exported")
  }

  const handleSaveProduct = async () => {
    setSaving(true)
    try {
      const payload = { ...editForm }
      if (imagePreviews.length > 0) {
        const newImages = imagePreviews.filter(s => s.startsWith("data:"))
        if (newImages.length > 0) payload.images = [...(editForm.images?.filter(s => !s.startsWith("data:")) || []), ...newImages]
      }
      if (imagePreview?.startsWith("data:")) payload.image = imagePreview
      const url = creating ? "/api/products" : `/api/products/${editingProduct?.id}`
      const res = await fetch(url, { method: creating ? "POST" : "PUT", headers: authHeaders, body: JSON.stringify(payload) })
      if (res.ok) { const d = await res.json(); if (d.products) setProducts(d.products); cancelEdit(); triggerRefresh(); showToast(creating ? "Product created" : "Product saved") }
      else { const d = await res.json(); showToast(d.error || "Failed", "error") }
    } catch { showToast("Failed to save", "error") } finally { setSaving(false) }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE", headers: authHeaders })
      if (res.ok) { const d = await res.json(); if (d.products) setProducts(d.products); triggerRefresh(); showToast("Product deleted") }
    } catch { showToast("Failed to delete", "error") }
  }

  const cancelEdit = () => { setEditingProduct(null); setCreating(false); setEditForm(emptyProduct()); setImagePreview(null); setImagePreviews([]) }
  const startEdit = (p: Product) => { setEditingProduct(p); setEditForm({ ...p }); setCreating(false); setImagePreview(p.image); setImagePreviews(p.images || []) }
  const startCreate = () => { setCreating(true); setEditingProduct(null); setEditForm(emptyProduct()); setImagePreview(null); setImagePreviews([]) }
  const updateField = (field: string, value: any) => setEditForm(p => ({ ...p, [field]: value }))

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024)
    if (validFiles.length !== files.length) { showToast("Some files exceed 2MB limit", "error") }
    if (!validFiles.length) return
    const readers = validFiles.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    }))
    Promise.all(readers).then((results) => {
      setImagePreviews(prev => [...prev, ...results])
      setImagePreview(results[0])
    })
  }

  const saveRates = async () => {
    setRateSaving(true); setRateSaved(false)
    try {
      for (const p of provinces) {
        const r = provinceRates[p.id]
        if (r !== undefined && (r.home !== p.rateHome || r.office !== p.rateOffice)) {
          await fetch("/api/provinces", { method: "PUT", headers: authHeaders, body: JSON.stringify({ provinceId: p.id, rateHome: r.home, rateOffice: r.office }) })
        }
      }
      setRateSaved(true); showToast("Rates saved"); setTimeout(() => setRateSaved(false), 2000)
    } catch { showToast("Failed to save rates", "error") } finally { setRateSaving(false) }
  }

  const saveHomepage = async () => {
    localStorage.setItem("alpha-homepage", JSON.stringify(homepageSettings))
    setHomepageSaved(true); showToast("Homepage settings saved")
    setTimeout(() => setHomepageSaved(false), 2000)
  }

  const getProvinceName = (p: Province) => lang === "ar" ? p.nameAr : lang === "fr" ? p.nameFr : p.name

  const getTabLabel = (t: typeof sidebarTabs[0]) => lang === "ar" ? t.labelAr : lang === "fr" ? t.labelFr : t.label

  const inputClass = "input-cyber w-full"
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5"

  return (
    <div className="min-h-screen bg-dark flex" dir={dir}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in-up flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {toast.type === "success" ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-64 glass border-r border-white/[0.04] transition-all duration-300 flex-shrink-0">
        <div className="p-5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber/20 to-cyber/5 border border-cyber/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-wider">ALPHA</p>
              <p className="text-cyber text-[10px] font-medium tracking-[0.2em]">ADMIN</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarTabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key === "orders") setNewOrderCount(0) }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                tab === t.key
                  ? "bg-cyber/10 text-cyber border border-cyber/20 shadow-lg shadow-cyber/5"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent"
              )}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                tab === t.key ? "bg-cyber/10" : "bg-white/[0.03] group-hover:bg-white/[0.05]")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
              </div>
              <span className="flex-1 text-left">{getTabLabel(t)}</span>
              {t.key === "orders" && pendingOrders.length > 0 && (
                <span className="bg-cyber/20 text-cyber text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrders.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.04]">
          <a href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-all">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <span>View Site</span>
          </a>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.06] px-1 safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {sidebarTabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key === "orders") setNewOrderCount(0) }}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-all min-w-0 flex-1",
                tab === t.key ? "text-cyber" : "text-gray-500"
              )}>
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
                {t.key === "orders" && pendingOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyber text-dark text-[8px] rounded-full flex items-center justify-center font-bold">{pendingOrders.length}</span>
                )}
              </div>
              <span className="truncate max-w-full">{getTabLabel(t)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden pb-16 md:pb-0">
        {/* Top Bar */}
        <div className="glass border-b border-white/[0.04]">
          <div className="flex items-center justify-between px-3 md:px-6 h-12 md:h-16">
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold text-white capitalize truncate">{getTabLabel(sidebarTabs.find(t => t.key === tab) || sidebarTabs[0])}</h1>
              <p className="hidden md:block text-xs text-gray-500">
                {orders.length} orders &middot; {products.length} products &middot; {formatPrice(totalRevenue, lang)} revenue
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Notification bell */}
              <button onClick={() => { setNewOrderCount(0); setTab("orders") }}
                className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-all">
                <svg className="w-4 md:w-5 h-4 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {newOrderCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-cyber text-dark text-[8px] md:text-[10px] rounded-full flex items-center justify-center font-bold animate-scale-in">{newOrderCount}</span>
                )}
              </button>
              {/* Refresh */}
              <button onClick={triggerRefresh}
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-all">
                <svg className="w-4 md:w-5 h-4 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {tab === "overview" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[
                  { label: "Revenue", value: formatPrice(totalRevenue, lang), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-cyber", trend: revenueTrend >= 0 ? "+" + revenueTrend.toFixed(1) + "%" : revenueTrend.toFixed(1) + "%", trendUp: revenueTrend >= 0 },
                  { label: "Orders", value: orders.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-pink-400", trend: "+12%", trendUp: true },
                  { label: "Products", value: products.length, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-yellow-400", trend: "+0%", trendUp: true },
                  { label: "Pending", value: pendingOrders.length, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-orange-400", trend: pendingOrders.length > 0 ? "Needs attention" : "All clear", trendUp: false },
                  { label: "Delivered", value: deliveredOrders.length, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-400", trend: deliveredOrders.length > 0 ? ((deliveredOrders.length / Math.max(orders.length, 1)) * 100).toFixed(0) + "% rate" : "No data", trendUp: true },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-white/[0.04] hover:border-white/[0.08] transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.06] transition-all">
                        <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} /></svg>
                      </div>
                      <span className={`text-[11px] font-medium flex items-center gap-0.5 ${stat.trendUp ? "text-green-400" : stat.label === "Pending" && pendingOrders.length > 0 ? "text-orange-400" : "text-gray-500"}`}>
                        {stat.trendUp ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        )}
                        {stat.trend}
                      </span>
                    </div>
                    <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
                    <select className="input-cyber text-xs py-1.5 w-32">
                      <option>Last 6 months</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2 h-52">
                    {monthlyData.map((d, i) => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] text-cyber font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity">{formatPrice(d.revenue, lang)}</span>
                        <div
                          className="w-full rounded-t-lg transition-all duration-700 cursor-pointer relative"
                          style={{
                            height: `${Math.max((d.revenue / maxRevenue) * 100, 3)}%`,
                            background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]} 0%, ${COLORS[i % COLORS.length]}40 100%)`,
                            boxShadow: `0 0 20px ${COLORS[i % COLORS.length]}20`,
                          }}
                        >
                          <div className="absolute inset-0 bg-white/[0.05] opacity-0 hover:opacity-100 rounded-t-lg transition-opacity" />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{d.month.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales by Category */}
                <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white mb-6">Sales by Category</h3>
                  {salesByCategory.length > 0 ? (
                    <div className="space-y-4">
                      {salesByCategory.map(([cat, rev], i) => {
                        const pct = (rev / (salesByCategory[0]?.[1] || 1)) * 100
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-sm text-gray-400">{cat}</span>
                              </div>
                              <span className="text-sm font-bold text-white">{formatPrice(rev, lang)}</span>
                            </div>
                            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
                      <p className="text-sm">No sales data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products + Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topProducts.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                    <h3 className="text-lg font-bold text-white mb-6">Top Selling Products</h3>
                    <div className="space-y-3">
                      {topProducts.map((p, i) => {
                        const barPct = (p.count / topProducts[0].count) * 100
                        return (
                          <div key={p.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-all">
                            <span className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                            <img src={p.image} alt={p.name} className="w-11 h-11 object-cover rounded-xl flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-200 text-sm line-clamp-1">{p.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden max-w-[100px]">
                                  <div className="h-full rounded-full bg-gradient-to-r from-cyber to-cyber/40" style={{ width: `${barPct}%` }} />
                                </div>
                                <span className="text-[11px] text-gray-500">{p.count} sold</span>
                              </div>
                            </div>
                            <span className="font-bold text-cyber text-sm">{formatPrice(p.revenue, lang)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white mb-6">Order Status Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Confirmed", count: confirmedOrders.length, color: "bg-cyber", bar: "from-cyber to-cyber/60" },
                      { label: "Pending", count: pendingOrders.length, color: "bg-yellow-400", bar: "from-yellow-400 to-yellow-500/60" },
                      { label: "Shipped", count: shippedOrders.length, color: "bg-blue-400", bar: "from-blue-400 to-blue-500/60" },
                      { label: "Delivered", count: deliveredOrders.length, color: "bg-green-400", bar: "from-green-400 to-green-500/60" },
                      { label: "Cancelled", count: cancelledOrders.length, color: "bg-red-400", bar: "from-red-400 to-red-500/60" },
                    ].map(s => {
                      const pct = orders.length ? (s.count / orders.length) * 100 : 0
                      return (
                        <div key={s.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                              <span className="text-sm text-gray-400">{s.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{s.count}</span>
                              <span className="text-[11px] text-gray-500">({pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              {orders.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden border border-white/[0.04]">
                  <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                      <span className="text-xs text-gray-500">Latest 5</span>
                    </div>
                    <button onClick={() => setTab("orders")} className="text-xs text-cyber hover:underline flex items-center gap-1">
                      View All
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.02] text-gray-500 uppercase text-[11px] tracking-wider">
                          <th className="text-left p-4">Customer</th>
                          <th className="text-left p-4">Total</th>
                          <th className="text-left p-4">Items</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setTab("orders") }}>
                            <td className="p-4">
                              <p className="font-medium text-gray-200 text-sm">{order.customer?.firstName} {order.customer?.lastName}</p>
                              <p className="text-gray-500 text-[11px]">{order.customer?.email}</p>
                            </td>
                            <td className="p-4 font-bold text-cyber">{formatPrice(order.total, lang)}</td>
                            <td className="p-4 text-gray-400 text-xs">{order.items?.length || 0} items</td>
                            <td className="p-4">{statusBadge(order.status)}</td>
                            <td className="p-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
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
            <div className="animate-fade-in-up space-y-4">
              {/* Order Detail Modal */}
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
                  <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.08]" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 glass z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm text-gray-500">Order</span>
                          <span className="font-mono text-cyber font-bold text-lg">#{selectedOrder.id.slice(0, 8)}</span>
                          {statusBadge(selectedOrder.status)}
                        </div>
                        <p className="text-xs text-gray-500">{formatDateTime(selectedOrder.createdAt)}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-all">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Customer Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass rounded-xl p-4 border border-white/[0.04]">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Customer</span>
                          <p className="text-white text-sm font-medium mt-1">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-white/[0.04]">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Contact</span>
                          <p className="text-white text-sm mt-1">{selectedOrder.customer?.email}</p>
                          <p className="text-gray-400 text-xs">{selectedOrder.customer?.phone}</p>
                        </div>
                        <div className="col-span-2 glass rounded-xl p-4 border border-white/[0.04]">
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Delivery Address</span>
                          <p className="text-white text-sm mt-1">{selectedOrder.customer?.address}</p>
                          <p className="text-gray-400 text-xs">{selectedOrder.customer?.provinceName} &middot; {formatPrice(selectedOrder.deliveryRate || 0, lang)}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          Items ({selectedOrder.items?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {selectedOrder.items?.map((item: any) => (
                            <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                              <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-200 font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} &middot; {formatPrice(item.price, lang)} each</p>
                              </div>
                              <p className="text-sm font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="glass rounded-xl p-4 border border-white/[0.04] space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="text-white">{formatPrice(selectedOrder.subtotal || 0, lang)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-white">{formatPrice(selectedOrder.deliveryRate || 0, lang)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/[0.06]">
                          <span className="text-white">Total</span>
                          <span className="text-cyber">{formatPrice(selectedOrder.total || 0, lang)}</span>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div>
                        <h4 className="text-sm font-bold text-white mb-3">Status Timeline</h4>
                        <div className="flex items-center gap-2">
                          {STATUSES.map((s, i) => {
                            const isPast = STATUSES.indexOf(selectedOrder.status as any) >= i
                            const isCurrent = selectedOrder.status === s
                            return (
                              <div key={s} className="flex items-center">
                                <button
                                  onClick={() => handleStatusChange(selectedOrder.id, s)}
                                  disabled={updatingStatus === selectedOrder.id}
                                  className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                    isCurrent
                                      ? "bg-cyber/15 text-cyber border-cyber/30 shadow-lg shadow-cyber/10"
                                      : isPast
                                      ? "bg-white/[0.04] text-gray-500 border-white/[0.08]"
                                      : "bg-white/[0.02] text-gray-600 border-white/[0.04] hover:bg-white/[0.04] hover:text-gray-400 cursor-pointer"
                                  )}
                                >
                                  {isCurrent && <span className="w-2 h-2 rounded-full bg-cyber animate-pulse" />}
                                  {s}
                                </button>
                                {i < STATUSES.length - 1 && (
                                  <div className={cn("w-4 h-px mx-1", isPast ? "bg-cyber/30" : "bg-white/[0.06]")} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => { window.print() }}
                          className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl text-xs font-medium text-gray-400 border border-white/[0.06]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          Print Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Panel */}
              <div className="glass rounded-2xl overflow-hidden border border-white/[0.04]">
                {/* Filters */}
                <div className="p-5 border-b border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Orders
                      <span className="text-xs font-normal text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">{filteredOrders.length} total</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl text-xs font-medium text-gray-300 border border-white/[0.06] hover:border-cyber/20 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Search + Status Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input type="text" value={orderSearch} onChange={e => { setOrderSearch(e.target.value); setOrderPage(1) }}
                        placeholder="Search by name, email, phone or ID..." className="input-cyber w-full text-sm pl-10" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {["all", ...STATUSES].map(f => (
                        <button key={f} onClick={() => { setOrderFilter(f); setOrderPage(1) }}
                          className={cn("px-4 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all border",
                            orderFilter === f
                              ? "bg-cyber/10 text-cyber border-cyber/30"
                              : "glass glass-hover text-gray-500 border-white/[0.06]")}>{f}</button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range + Bulk */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">From:</span>
                      <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setOrderPage(1) }} className="input-cyber text-xs py-2" />
                      <span className="text-xs text-gray-500">To:</span>
                      <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setOrderPage(1) }} className="input-cyber text-xs py-2" />
                      {(dateFrom || dateTo) && (
                        <button onClick={() => { setDateFrom(""); setDateTo("") }} className="text-xs text-cyber hover:underline">Clear</button>
                      )}
                    </div>
                    {selectedOrders.size > 0 && (
                      <div className="flex items-center gap-2 sm:ml-auto">
                        <span className="text-xs font-medium text-cyber bg-cyber/10 px-2.5 py-1 rounded-full">{selectedOrders.size} selected</span>
                        <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="input-cyber text-xs py-2">
                          <option value="">Change status...</option>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleBulkStatus} disabled={!bulkStatus}
                          className="px-4 py-2 btn-cyber-solid text-xs disabled:opacity-50">Apply</button>
                        <button onClick={() => setSelectedOrders(new Set())} className="text-xs text-gray-500 hover:text-white px-2">Clear</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table */}
                {filteredOrders.length === 0 ? (
                  <div className="p-16 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 text-sm">No orders found</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/[0.02] text-gray-500 uppercase text-[11px] tracking-wider">
                            <th className="text-left p-4 w-10">
                              <input type="checkbox"
                                onChange={e => { if (e.target.checked) setSelectedOrders(new Set(pagedOrders.map(o => o.id))); else setSelectedOrders(new Set()) }}
                                className="w-4 h-4 rounded text-cyber focus:ring-cyber/30 bg-white/[0.05] border-white/[0.2]" />
                            </th>
                            <th className="text-left p-4">ID{sorter("id")}</th>
                            <th className="text-left p-4">Customer{sorter("customer")}</th>
                            <th className="text-left p-4 cursor-pointer" onClick={() => toggleOrderSort("total")}>Total{sorter("total")}</th>
                            <th className="text-left p-4">Items</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4 cursor-pointer" onClick={() => toggleOrderSort("createdAt")}>Date{sorter("createdAt")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedOrders.map(order => (
                            <tr key={order.id} className={cn("border-t border-white/[0.04] transition-colors",
                              selectedOrders.has(order.id) ? "bg-cyber/5" : "hover:bg-white/[0.02]")}>
                              <td className="p-4">
                                <input type="checkbox" checked={selectedOrders.has(order.id)}
                                  onChange={e => { const s = new Set(selectedOrders); e.target.checked ? s.add(order.id) : s.delete(order.id); setSelectedOrders(s) }}
                                  className="w-4 h-4 rounded text-cyber focus:ring-cyber/30 bg-white/[0.05] border-white/[0.2]" />
                              </td>
                              <td className="p-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                <span className="font-mono text-xs text-cyber font-bold">#{order.id.slice(0, 8)}</span>
                              </td>
                              <td className="p-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                <p className="font-medium text-gray-200 text-sm">{order.customer?.firstName} {order.customer?.lastName}</p>
                                <p className="text-gray-500 text-[11px]">{order.customer?.email}</p>
                              </td>
                              <td className="p-4 font-bold text-cyber">{formatPrice(order.total, lang)}</td>
                              <td className="p-4">
                                <span className="text-xs text-gray-400 bg-white/[0.04] px-2 py-1 rounded-full">{order.items?.length || 0}</span>
                              </td>
                              <td className="p-4">
                                <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                                  disabled={updatingStatus === order.id}
                                  className="glass text-xs font-medium px-2.5 py-1.5 rounded-xl border-0 cursor-pointer text-gray-300">
                                  {STATUSES.map(s => <option key={s} value={s} className="bg-dark">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                              </td>
                              <td className="p-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-gray-500">Page {orderPage} of {totalPages || 1}</span>
                      <div className="flex gap-1.5">
                        <button disabled={orderPage <= 1} onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                          className="px-3.5 py-1.5 glass glass-hover rounded-xl disabled:opacity-30 text-gray-400 border border-white/[0.06]">Prev</button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const start = Math.max(1, orderPage - 2)
                          const page = start + i
                          if (page > totalPages) return null
                          return (
                            <button key={page} onClick={() => setOrderPage(page)}
                              className={cn("w-8 h-8 rounded-xl text-sm font-medium transition-all",
                                page === orderPage ? "bg-cyber/10 text-cyber border border-cyber/30" : "glass glass-hover text-gray-500 border border-white/[0.06]")}>{page}</button>
                          )
                        })}
                        <button disabled={orderPage >= totalPages} onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                          className="px-3.5 py-1.5 glass glass-hover rounded-xl disabled:opacity-30 text-gray-400 border border-white/[0.06]">Next</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Product Edit/Create Modal */}
              {(editingProduct || creating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={cancelEdit}>
                  <div className="glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/[0.08]" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-white/[0.06] flex items-center justify-between sticky top-0 glass z-10">
                      <h3 className="text-lg font-bold text-white">{creating ? "New Product" : "Edit Product"}</h3>
                      <button onClick={cancelEdit} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-all">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className={labelClass}>Product Name</label>
                        <input value={editForm.name || ""} onChange={e => updateField("name", e.target.value)} className={inputClass} placeholder="Enter product name" />
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={editForm.description || ""} onChange={e => updateField("description", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Describe your product..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Price (DZD)</label>
                          <input type="number" value={editForm.price || 0} onChange={e => updateField("price", parseInt(e.target.value) || 0)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Quantity in Stock</label>
                          <input type="number" value={editForm.quantity ?? 999} onChange={e => updateField("quantity", Math.max(0, parseInt(e.target.value) || 0))} className={inputClass} min="0" />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Category</label>
                        <input value={editForm.category || ""} onChange={e => updateField("category", e.target.value)} className={inputClass} placeholder="e.g. Electronics, Fashion" />
                      </div>
                      <div>
                        <label className={labelClass}>Images (upload multiple)</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-5 py-2.5 glass glass-hover rounded-xl text-sm font-medium text-gray-300 cursor-pointer border border-white/[0.06] hover:border-cyber/20 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Upload Images
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                          </label>
                          <span className="text-xs text-gray-500">or</span>
                          <input value={editForm.image || ""} onChange={e => updateField("image", e.target.value)} className={`${inputClass} text-xs flex-1`} placeholder="Paste image URL..." />
                        </div>
                        {(imagePreviews.length > 0 || (editForm.images && editForm.images.length > 0)) && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Gallery ({imagePreviews.length + (editForm.images?.filter(s => !s.startsWith("data:")).length || 0)} images)</p>
                            <div className="flex flex-wrap gap-2">
                              {[...(editForm.images?.filter(s => !s.startsWith("data:")) || []), ...imagePreviews].map((src, idx) => (
                                <div key={idx} className="relative group">
                                  <img src={src} alt="" className="w-16 h-16 object-cover rounded-xl border border-white/[0.06]" />
                                  <button onClick={() => {
                                    if (idx < (editForm.images?.filter(s => !s.startsWith("data:")).length || 0)) {
                                      const filtered = (editForm.images || []).filter(s => !s.startsWith("data:"))
                                      const newImgs = filtered.filter((_, i) => i !== idx)
                                      updateField("images", newImgs)
                                    } else {
                                      const localIdx = idx - (editForm.images?.filter(s => !s.startsWith("data:")).length || 0)
                                      setImagePreviews(prev => prev.filter((_, i) => i !== localIdx))
                                    }
                                  }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">×</button>
                                  <button onClick={() => {
                                    const allImgs = [...(editForm.images?.filter(s => !s.startsWith("data:")) || []), ...imagePreviews]
                                    setImagePreview(allImgs[idx])
                                  }} className="absolute bottom-1 right-1 w-4 h-4 bg-cyber/80 text-dark rounded-full flex items-center justify-center text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">★</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Original Price</label>
                          <input type="number" value={editForm.originalPrice || 0} onChange={e => updateField("originalPrice", parseInt(e.target.value) || 0)} className={inputClass} />
                        </div>
                        <div className="flex items-end gap-3 pb-1">
                          <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl hover:bg-white/[0.02] transition-all border border-white/[0.06]">
                            <input type="checkbox" checked={editForm.freeShipping ?? false} onChange={e => updateField("freeShipping", e.target.checked)}
                              className="w-4 h-4 rounded text-cyber focus:ring-cyber/30 bg-white/[0.05] border-white/[0.2]" />
                            <span className="text-sm text-gray-300 whitespace-nowrap">Free delivery</span>
                          </label>
                          <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl hover:bg-white/[0.02] transition-all border border-white/[0.06]">
                            <input type="checkbox" checked={editForm.featured ?? false} onChange={e => updateField("featured", e.target.checked)}
                              className="w-4 h-4 rounded text-cyber focus:ring-cyber/30 bg-white/[0.05] border-white/[0.2]" />
                            <span className="text-sm text-gray-300">Featured</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-white/[0.06] flex justify-end gap-3">
                      <button onClick={cancelEdit} className="px-6 py-2.5 glass glass-hover rounded-xl text-sm font-medium text-gray-300 border border-white/[0.06]">Cancel</button>
                      <button onClick={handleSaveProduct} disabled={saving}
                        className="px-6 py-2.5 btn-cyber-solid text-sm disabled:opacity-50 flex items-center gap-2">
                        {saving ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Saving...
                          </>
                        ) : creating ? "Create Product" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Panel */}
              <div className="glass rounded-2xl overflow-hidden border border-white/[0.04]">
                <div className="p-5 border-b border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Products
                      <span className="text-xs font-normal text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">{filteredProducts.length} items</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setProductView(productView === "grid" ? "list" : "grid")}
                        className="w-9 h-9 rounded-xl glass glass-hover flex items-center justify-center border border-white/[0.06]">
                        {productView === "grid" ? (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        )}
                      </button>
                      <button onClick={startCreate} className="flex items-center gap-2 px-5 py-2.5 btn-cyber-solid text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add Product
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input type="text" value={productSearch} onChange={e => { setProductSearch(e.target.value); setProductPage(1) }} placeholder="Search products..." className="input-cyber w-full text-sm pl-10" />
                    </div>
                    <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setProductPage(1) }} className="input-cyber text-sm">
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-16 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 text-sm">No products found</p>
                    <button onClick={startCreate} className="mt-3 text-xs text-cyber hover:underline">Add your first product</button>
                  </div>
                ) : productView === "grid" ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4">
                      {filteredProducts.slice((productPage - 1) * PER_PAGE, productPage * PER_PAGE).map(p => (
                        <div key={p.id} className="glass rounded-2xl overflow-hidden border border-white/[0.04] hover:border-cyber/20 transition-all group">
                          <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(p)} className="flex-1 py-1.5 bg-white/90 text-dark text-[10px] font-bold rounded-lg hover:bg-white transition-all">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="py-1.5 bg-red-500/90 text-white text-[10px] font-bold rounded-lg px-2 hover:bg-red-500 transition-all">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                            {p.featured && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyber/90 text-dark text-[9px] font-bold rounded-full">FEATURED</div>
                            )}
                            {p.freeShipping && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyber/90 text-dark text-[9px] font-bold rounded-full">FREE</div>
                            )}
                            {p.quantity <= 0 && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white text-[9px] font-bold rounded-full">OUT</div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-gray-500 mb-0.5">{p.category}</p>
                            <p className="font-medium text-gray-200 text-sm line-clamp-1">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-cyber text-sm">{formatPrice(p.price, lang)}</span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[10px] text-gray-600 line-through">{formatPrice(p.originalPrice, lang)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-gray-500">Page {productPage} of {productPages || 1}</span>
                      <div className="flex gap-1.5">
                        <button disabled={productPage <= 1} onClick={() => setProductPage(p => Math.max(1, p - 1))}
                          className="px-3.5 py-1.5 glass glass-hover rounded-xl disabled:opacity-30 text-gray-400 border border-white/[0.06]">Prev</button>
                        {Array.from({ length: Math.min(productPages, 5) }, (_, i) => {
                          const start = Math.max(1, productPage - 2); const page = start + i
                          if (page > productPages) return null
                          return (
                            <button key={page} onClick={() => setProductPage(page)}
                              className={cn("w-8 h-8 rounded-xl text-sm font-medium transition-all",
                                page === productPage ? "bg-cyber/10 text-cyber border border-cyber/30" : "glass glass-hover text-gray-500 border border-white/[0.06]")}>{page}</button>
                          )
                        })}
                        <button disabled={productPage >= productPages} onClick={() => setProductPage(p => Math.min(productPages, p + 1))}
                          className="px-3.5 py-1.5 glass glass-hover rounded-xl disabled:opacity-30 text-gray-400 border border-white/[0.06]">Next</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/[0.02] text-gray-500 uppercase text-[11px] tracking-wider">
                            <th className="text-left p-4">Image</th>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Category</th>
                            <th className="text-left p-4">Price</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.slice((productPage - 1) * PER_PAGE, productPage * PER_PAGE).map(p => (
                            <tr key={p.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                              <td className="p-4"><img src={p.image} alt="" className="w-11 h-11 object-cover rounded-xl" /></td>
                              <td className="p-4">
                                <p className="font-medium text-gray-200">{p.name}</p>
                                <p className="text-gray-500 text-[11px] line-clamp-1">{p.description}</p>
                              </td>
                              <td className="p-4"><span className="text-xs bg-white/[0.04] text-gray-400 px-2.5 py-1 rounded-full">{p.category}</span></td>
                              <td className="p-4 font-bold text-cyber">{formatPrice(p.price, lang)}</td>
                              <td className="p-4">
                                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full",
                                  p.quantity > 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>
                                  {p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button onClick={() => startEdit(p)} className="px-3 py-1.5 glass glass-hover rounded-lg text-xs font-medium text-cyber border border-white/[0.06]">Edit</button>
                                  <button onClick={() => handleDeleteProduct(p.id, p.name)} className="px-3 py-1.5 glass glass-hover rounded-lg text-xs font-medium text-red-400 border border-white/[0.06]">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-gray-500">Page {productPage} of {productPages || 1}</span>
                      <div className="flex gap-1.5">
                        <button disabled={productPage <= 1} onClick={() => setProductPage(p => Math.max(1, p - 1))}
                          className="px-3.5 py-1.5 glass glass-hover rounded-xl disabled:opacity-30 text-gray-400 border border-white/[0.06]">Prev</button>
                        {Array.from({ length: Math.min(productPages, 5) }, (_, i) => {
                          const start = Math.max(1, productPage - 2); const page = start + i
                          if (page > productPages) return null
                          return (
                            <button key={page} onClick={() => setProductPage(page)}
                              className={cn("w-8 h-8 rounded-xl text-sm font-medium transition-all",
                                page === productPage ? "bg-cyber/10 text-cyber border border-cyber/30" : "glass glass-hover text-gray-500 border border-white/[0.06]")}>{page}</button>
                          )
                        })}
                        <button disabled={productPage >= productPages} onClick={() => setProductPage(p => Math.min(productPages, p + 1))}
                          className="px-3.5 py-1.5 glass glass-hover rounded-xl disabled:opacity-30 text-gray-400 border border-white/[0.06]">Next</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: formatPrice(totalRevenue, lang), sub: `${orders.length} orders`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-cyber" },
                  { label: "Average Order", value: formatPrice(orders.length ? Math.round(totalRevenue / orders.length) : 0, lang), sub: "per order", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-pink-400" },
                  { label: "Conversion Rate", value: orders.length > 0 ? "—" : "0%", sub: "visitors to orders", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "text-green-400" },
                  { label: "In Stock", value: products.filter(p => p.quantity > 0).length, sub: `${products.length} total`, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-yellow-400" },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-white/[0.04]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{stat.sub}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} /></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Revenue + Orders Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white mb-6">Monthly Revenue</h3>
                  <div className="flex items-end gap-2 h-48">
                    {monthlyData.map((d, i) => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <span className="text-[10px] text-cyber font-bold leading-none">{formatPrice(d.revenue, lang)}</span>
                        <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 3)}%`, background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]} 0%, ${COLORS[i % COLORS.length]}30 100%)` }} />
                        <span className="text-[10px] text-gray-500 font-medium">{d.month.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white mb-6">Monthly Orders</h3>
                  <div className="flex items-end gap-2 h-48">
                    {monthlyOrders.map((d, i) => {
                      const max = Math.max(...monthlyOrders.map(m => m.count), 1)
                      return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[10px] text-pink-400 font-bold leading-none">{d.count}</span>
                          <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: `${(d.count / max) * 100}%`, background: `linear-gradient(180deg, #f472b6 0%, #f472b630 100%)` }} />
                          <span className="text-[10px] text-gray-500 font-medium">{d.month.slice(5)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Category Performance + Top Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white mb-6">Category Performance</h3>
                  {salesByCategory.length > 0 ? (
                    <div className="space-y-4">
                      {salesByCategory.map(([cat, rev], i) => {
                        const pct = (rev / (salesByCategory[0]?.[1] || 1)) * 100
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{cat}</span>
                              <span className="font-bold text-white">{formatPrice(rev, lang)}</span>
                            </div>
                            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-600 text-sm">No category data yet</div>
                  )}
                </div>
                {topProducts.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                    <h3 className="text-lg font-bold text-white mb-6">Top 5 Products</h3>
                    <div className="space-y-3">
                      {topProducts.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-all">
                          <span className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-200 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-gray-500">{p.count} sold &middot; {formatPrice(p.revenue, lang)}</p>
                          </div>
                          <span className="font-bold text-cyber text-sm">{formatPrice(p.revenue, lang)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Distribution Full */}
              <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                <h3 className="text-lg font-bold text-white mb-6">Order Status Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    { label: "Confirmed", count: confirmedOrders.length, color: "text-cyber", bg: "bg-cyber/10", border: "border-cyber/20" },
                    { label: "Pending", count: pendingOrders.length, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                    { label: "Shipped", count: shippedOrders.length, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Delivered", count: deliveredOrders.length, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                    { label: "Cancelled", count: cancelledOrders.length, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.border} rounded-2xl p-4 border text-center`}>
                      <p className={`text-3xl font-bold ${s.color} mb-1`}>{s.count}</p>
                      <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-6 animate-fade-in-up max-w-4xl">
              {/* Homepage Settings */}
              <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Homepage Settings</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Customize your storefront</p>
                  </div>
                  <button onClick={saveHomepage} className="flex items-center gap-2 px-5 py-2.5 btn-cyber-solid text-sm">
                    {homepageSaved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Hero Title</label>
                    <input value={homepageSettings.heroTitle} onChange={e => setHomepageSettings(s => ({ ...s, heroTitle: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Hero Subtitle</label>
                    <input value={homepageSettings.heroSubtitle} onChange={e => setHomepageSettings(s => ({ ...s, heroSubtitle: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Announcement Bar</label>
                    <input value={homepageSettings.announcement} onChange={e => setHomepageSettings(s => ({ ...s, announcement: e.target.value }))} className={inputClass} placeholder="Announcement text..." />
                  </div>
                  <div>
                    <label className={labelClass}>Featured Products</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      {products.map(p => (
                        <label key={p.id} className={cn("flex items-center gap-2 p-2.5 rounded-xl cursor-pointer border transition-all",
                          homepageSettings.featuredProductIds.includes(p.id) ? "border-cyber/30 bg-cyber/5" : "border-white/[0.06] hover:border-white/[0.12]")}>
                          <input type="checkbox" checked={homepageSettings.featuredProductIds.includes(p.id)}
                            onChange={e => { if (e.target.checked) setHomepageSettings(s => ({ ...s, featuredProductIds: [...s.featuredProductIds, p.id] }))
                            else setHomepageSettings(s => ({ ...s, featuredProductIds: s.featuredProductIds.filter(id => id !== p.id) })) }}
                            className="w-4 h-4 rounded text-cyber focus:ring-cyber/30" />
                          <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-lg" />
                          <span className="text-xs text-gray-300 line-clamp-1">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Rates */}
              <div className="glass rounded-2xl p-6 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Delivery Rates by Province</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Set per-wilaya delivery pricing</p>
                  </div>
                  <button onClick={saveRates} disabled={rateSaving} className="flex items-center gap-2 px-5 py-2.5 btn-cyber-solid text-sm disabled:opacity-50">
                    {rateSaving ? "Saving..." : rateSaved ? "Saved!" : "Save Rates"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">Set delivery prices for each wilaya — separate rates for home delivery and office delivery.</p>
                <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 glass z-10">
                      <tr className="text-gray-500 uppercase text-[11px] tracking-wider">
                        <th className="text-left p-3 w-12">#</th>
                        <th className="text-left p-3">Province</th>
                        <th className="text-right p-3 w-32">Home (DZD)</th>
                        <th className="text-right p-3 w-32">Office (DZD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinces.map((p) => {
                        const r = provinceRates[p.id] || { home: p.rateHome, office: p.rateOffice }
                        return (
                          <tr key={p.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 text-gray-500 font-mono text-xs">{p.id}</td>
                            <td className="p-3 text-gray-200 font-medium">{getProvinceName(p)}</td>
                            <td className="p-3 text-right">
                              <input type="number" value={r.home}
                                onChange={e => setProvinceRates(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || r), home: parseInt(e.target.value) || 0 } }))}
                                className="input-cyber w-24 text-sm py-1.5 text-right" />
                            </td>
                            <td className="p-3 text-right">
                              <input type="number" value={r.office}
                                onChange={e => setProvinceRates(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || r), office: parseInt(e.target.value) || 0 } }))}
                                className="input-cyber w-24 text-sm py-1.5 text-right" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
