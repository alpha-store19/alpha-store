"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

interface Province { id: string; name: string; nameAr: string; nameFr: string; zone: string }

const emptyForm = { firstName: "", lastName: "", phone: "", email: "", address: "", province: "" }

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, totalPrice } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [deliveryRate, setDeliveryRate] = useState(0)

  useEffect(() => {
    fetch("/api/provinces")
      .then((r) => r.json())
      .then((data) => setProvinces(data.provinces || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (form.province) {
      fetch(`/api/provinces`)
        .then((r) => r.json())
        .then((data) => {
          const prov = (data.provinces || []).find((p: Province) => p.id === form.province)
          if (prov) {
            const zone = (data.zones || []).find((z: any) => z.id === prov.zone)
            setDeliveryRate(zone?.rate || 0)
          }
        })
        .catch(() => {})
    }
  }, [form.province])

  const grandTotal = totalPrice + deliveryRate

  const getProvinceName = (id: string) => {
    const p = provinces.find((p) => p.id === id)
    if (!p) return ""
    return lang === "ar" ? p.nameAr : lang === "fr" ? p.nameFr : p.name
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const goToConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.province) return
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
        setStep("success")
        setTimeout(() => router.push("/"), 4000)
      }
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "input-cyber w-full"
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5"

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <div className="animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{t("checkout.success", lang)}</h1>
          <p className="text-gray-400 mb-8">You will be redirected shortly.</p>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
        <div className="animate-scale-in">
          <h1 className="text-3xl font-bold text-white mb-8">{t("checkout.confirmTitle", lang)}</h1>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">{t("checkout.shipping", lang)}</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">{t("checkout.firstName", lang)}:</span> <span className="font-medium text-gray-200">{form.firstName}</span></p>
              <p><span className="text-gray-500">{t("checkout.lastName", lang)}:</span> <span className="font-medium text-gray-200">{form.lastName}</span></p>
              <p><span className="text-gray-500">{t("checkout.phone", lang)}:</span> <span className="font-medium text-gray-200">{form.phone}</span></p>
              <p><span className="text-gray-500">{t("checkout.email", lang)}:</span> <span className="font-medium text-gray-200">{form.email}</span></p>
              <p><span className="text-gray-500">{t("checkout.province", lang)}:</span> <span className="font-medium text-gray-200">{getProvinceName(form.province)}</span></p>
              <p><span className="text-gray-500">{t("checkout.address", lang)}:</span> <span className="font-medium text-gray-200">{form.address}</span></p>
            </div>
            <button
              onClick={() => setStep("form")}
              className="mt-4 text-sm text-cyber hover:text-cyber-light font-medium transition-colors"
            >
              {t("checkout.edit", lang)}
            </button>
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">{t("cart.summary", lang)}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.06] pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                <span className="font-medium text-white">{formatPrice(totalPrice, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.delivery", lang)}</span>
                <span className="font-medium text-white">{formatPrice(deliveryRate, lang)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/[0.06]">
                <span className="text-white">{t("checkout.totalWithDelivery", lang)}</span>
                <span className="text-cyber">{formatPrice(grandTotal, lang)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep("form")}
              className="flex-1 py-3 glass glass-hover text-gray-300 rounded-full font-semibold transition-all"
            >
              {t("admin.cancel", lang)}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] btn-cyber-solid py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
      <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in-up">{t("checkout.title", lang)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={goToConfirm} className="lg:col-span-3 space-y-6">
          <div className="glass rounded-2xl p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-6">{t("checkout.shipping", lang)}</h2>
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
            className="w-full btn-cyber-solid py-3 text-lg"
          >
            {t("checkout.placeOrder", lang)}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 sticky top-28 cyber-border">
            <h2 className="text-xl font-bold text-white mb-4">{t("cart.summary", lang)}</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.06] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                <span className="font-medium text-white">{formatPrice(totalPrice, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.delivery", lang)}</span>
                <span className={`font-medium ${form.province ? "text-white" : "text-gray-600"}`}>
                  {form.province ? formatPrice(deliveryRate, lang) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/[0.06]">
                <span className="text-white">{t("checkout.totalWithDelivery", lang)}</span>
                <span className="text-cyber">
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
