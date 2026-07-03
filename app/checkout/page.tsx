"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

import Link from "next/link"

interface Province {
  id: string
  name: string
  nameAr: string
  nameFr: string
  zone: string
}

interface Zone {
  id: string
  name: string
  nameAr: string
  nameFr: string
  rate: number
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const { lang } = useLang()
  const dir = getDir(lang)
  const [step, setStep] = useState<"form" | "confirm">("form")
  const [submitting, setSubmitting] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [deliveryRate, setDeliveryRate] = useState(0)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
  })

  useEffect(() => {
    fetch("/api/provinces")
      .then((r) => r.json())
      .then((data) => {
        setProvinces(data.provinces || [])
        setZones(data.zones || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (form.province) {
      const prov = provinces.find((p) => p.id === form.province)
      const zone = zones.find((z) => z.id === prov?.zone)
      setDeliveryRate(zone?.rate ?? 0)
    } else {
      setDeliveryRate(0)
    }
  }, [form.province, provinces, zones])

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("checkout.nothing", lang)}</h1>
        <p className="text-gray-500 mb-8">{t("checkout.nothing.desc", lang)}</p>
        <Link
          href="/products"
          className="inline-block bg-[#e94560] hover:bg-[#ff6b81] text-white px-10 py-3 rounded-full font-semibold transition-all"
        >
          {t("checkout.browse", lang)}
        </Link>
      </div>
    )
  }

  const grandTotal = totalPrice + deliveryRate

  const getProvinceName = (id: string) => {
    const prov = provinces.find((p) => p.id === id)
    if (!prov) return ""
    if (lang === "ar") return prov.nameAr
    if (lang === "fr") return prov.nameFr
    return prov.name
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const goToConfirm = (e: FormEvent) => {
    e.preventDefault()
    setStep("confirm")
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
        })),
        subtotal: totalPrice,
        total: grandTotal,
        deliveryRate,
      }

      const customerData = {
        ...form,
        provinceName: getProvinceName(form.province),
        deliveryRate,
      }

      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderData.items, customer: customerData, subtotal: orderData.subtotal, total: orderData.total, deliveryRate: orderData.deliveryRate }),
      })

      if (orderRes.ok) {
        clearCart()
        router.push("/?order=success")
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/20 outline-none transition-all bg-white"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  if (step === "confirm") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
        <div className="animate-scale-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("checkout.confirmTitle", lang)}</h1>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("checkout.shipping", lang)}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">{t("checkout.firstName", lang)}:</span> <span className="font-medium">{form.firstName}</span></p>
              <p><span className="text-gray-500">{t("checkout.lastName", lang)}:</span> <span className="font-medium">{form.lastName}</span></p>
              <p><span className="text-gray-500">{t("checkout.phone", lang)}:</span> <span className="font-medium">{form.phone}</span></p>
              <p><span className="text-gray-500">{t("checkout.email", lang)}:</span> <span className="font-medium">{form.email}</span></p>
              <p><span className="text-gray-500">{t("checkout.province", lang)}:</span> <span className="font-medium">{getProvinceName(form.province)}</span></p>
              <p><span className="text-gray-500">{t("checkout.address", lang)}:</span> <span className="font-medium">{form.address}</span></p>
            </div>
            <button
              onClick={() => setStep("form")}
              className="mt-4 text-sm text-[#e94560] hover:text-[#ff6b81] font-medium transition-colors"
            >
              {t("checkout.edit", lang)}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("cart.summary", lang)}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity, lang)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                <span className="font-medium">{formatPrice(totalPrice, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.delivery", lang)}</span>
                <span className="font-medium">{formatPrice(deliveryRate, lang)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>{t("checkout.totalWithDelivery", lang)}</span>
                <span className="text-[#e94560]">{formatPrice(grandTotal, lang)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("form")}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 hover:border-gray-300 rounded-full font-semibold transition-all"
            >
              {t("admin.cancel", lang)}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] bg-[#e94560] hover:bg-[#ff6b81] disabled:bg-gray-400 text-white py-3 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-[#e94560]/30"
            >
              {submitting ? t("checkout.processing", lang) : t("checkout.confirm", lang)}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 animate-fade-in-up">{t("checkout.title", lang)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={goToConfirm} className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t("checkout.shipping", lang)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("checkout.firstName", lang)}</label>
                <input required value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("checkout.lastName", lang)}</label>
                <input required value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("checkout.phone", lang)}</label>
                <input type="tel" required value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+213 5xx xx xx xx" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("checkout.email", lang)}</label>
                <input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("checkout.province", lang)}</label>
                <select
                  required
                  value={form.province}
                  onChange={(e) => updateField("province", e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("checkout.selectProvince", lang)}</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {lang === "ar" ? p.nameAr : lang === "fr" ? p.nameFr : p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("checkout.address", lang)}</label>
                <input required value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-full font-semibold text-lg transition-all hover:shadow-lg"
          >
            {t("checkout.placeOrder", lang)}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t("cart.summary", lang)}</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity, lang)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                <span className="font-medium">{formatPrice(totalPrice, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.delivery", lang)}</span>
                <span className={`font-medium ${form.province ? "text-gray-900" : "text-gray-400"}`}>
                  {form.province ? formatPrice(deliveryRate, lang) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>{t("checkout.totalWithDelivery", lang)}</span>
                <span className="text-[#e94560]">
                  {formatPrice(form.province ? grandTotal : totalPrice, lang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
