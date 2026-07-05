"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

interface Province { id: string; name: string; nameAr: string; nameFr: string; rateHome: number; rateOffice: number }

const emptyForm = { firstName: "", lastName: "", phone: "", email: "", address: "", province: "" }

const steps = [
  { key: "form", label: "Shipping", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { key: "confirm", label: "Review", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "success", label: "Done", icon: "M5 13l4 4L19 7" },
]

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
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home")

  useEffect(() => {
    fetch("/api/provinces")
      .then((r) => r.json())
      .then((data) => setProvinces(data.provinces || []))
      .catch(() => {})
  }, [])

  const hasFreeShippingItem = items.some(item => (item as any).freeShipping)

  useEffect(() => {
    if (form.province && !hasFreeShippingItem) {
      const prov = provinces.find((p) => p.id === form.province)
      setDeliveryRate(prov ? (deliveryType === "office" ? prov.rateOffice : prov.rateHome) : 0)
    } else if (hasFreeShippingItem) {
      setDeliveryRate(0)
    }
  }, [form.province, provinces, hasFreeShippingItem, deliveryType])

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
        deliveryType,
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

  const stepIndex = steps.findIndex(s => s.key === step)

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <div className="animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center animate-scale-in">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{t("checkout.success", lang)}</h1>
          <p className="text-gray-400 mb-4">Your order has been placed successfully!</p>
          <p className="text-sm text-gray-600">You will be redirected shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <div className="max-w-3xl mx-auto mb-12 animate-slide-up">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  i <= stepIndex
                    ? "bg-cyber text-dark font-bold"
                    : "glass text-gray-500"
                }`}>
                  {i < stepIndex ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                    </svg>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  i <= stepIndex ? "text-cyber" : "text-gray-600"
                }`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-3 sm:mx-4 transition-colors duration-300 ${
                  i < stepIndex ? "bg-cyber" : "bg-white/[0.06]"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={goToConfirm} className="lg:col-span-3 space-y-6">
            <div className="glass rounded-2xl p-6 sm:p-8 animate-slide-up">
              <h2 className="text-xl font-bold text-white mb-6">{t("checkout.shipping", lang)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>{t("checkout.firstName", lang)}</label>
                  <input required value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="Ahmed" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("checkout.lastName", lang)}</label>
                  <input required value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Benali" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("checkout.phone", lang)}</label>
                  <input type="tel" required value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+213 5xx xx xx xx" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("checkout.email", lang)}</label>
                  <input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="ahmed@example.com" className={inputClass} />
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
                  <input required value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="123 Rue Didouche Mourad" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>{t("checkout.deliveryType", lang)}</label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all flex-1 ${
                      deliveryType === "home" ? "border-cyber/40 bg-cyber/5 shadow-sm shadow-cyber/5" : "border-white/[0.06] hover:border-white/[0.12]"
                    }`}>
                      <input type="radio" name="deliveryType" value="home" checked={deliveryType === "home"} onChange={() => setDeliveryType("home")} className="w-4 h-4 text-cyber focus:ring-cyber/30" />
                      <div>
                        <span className="text-sm text-gray-200 font-medium">{t("checkout.homeDelivery", lang)}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{t("checkout.homeDelivery.desc", lang)}</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all flex-1 ${
                      deliveryType === "office" ? "border-cyber/40 bg-cyber/5 shadow-sm shadow-cyber/5" : "border-white/[0.06] hover:border-white/[0.12]"
                    }`}>
                      <input type="radio" name="deliveryType" value="office" checked={deliveryType === "office"} onChange={() => setDeliveryType("office")} className="w-4 h-4 text-cyber focus:ring-cyber/30" />
                      <div>
                        <span className="text-sm text-gray-200 font-medium">{t("checkout.officeDelivery", lang)}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{t("checkout.officeDelivery.desc", lang)}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-cyber-solid py-3.5 text-lg font-bold"
            >
              {t("checkout.placeOrder", lang)}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 lg:sticky lg:top-28 cyber-border animate-slide-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-xl font-bold text-white mb-4">{t("cart.summary", lang)}</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                  <span className="font-medium text-white">{formatPrice(totalPrice, lang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("checkout.delivery", lang)}</span>
                  <span className={`font-medium ${form.province ? "text-white" : "text-gray-600"}`}>
                    {hasFreeShippingItem ? "FREE" : form.province ? formatPrice(deliveryRate, lang) : "—"}
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
      )}

      {step === "confirm" && (
        <div className="max-w-2xl mx-auto">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-white mb-8">{t("checkout.confirmTitle", lang)}</h1>

            <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{t("checkout.shipping", lang)}</h2>
                <button
                  onClick={() => setStep("form")}
                  className="text-sm text-cyber hover:text-cyber-light font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {t("checkout.edit", lang)}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: t("checkout.firstName", lang), value: form.firstName },
                  { label: t("checkout.lastName", lang), value: form.lastName },
                  { label: t("checkout.phone", lang), value: form.phone },
                  { label: t("checkout.email", lang), value: form.email },
                  { label: t("checkout.province", lang), value: getProvinceName(form.province) },
                  { label: t("checkout.address", lang), value: form.address },
                  { label: t("checkout.deliveryType", lang), value: deliveryType === "home" ? t("checkout.homeDelivery", lang) : t("checkout.officeDelivery", lang) },
                ].map((item) => (
                  <div key={item.label} className="py-2.5 px-4 bg-white/[0.02] rounded-xl">
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-gray-200">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
              <h2 className="text-lg font-bold text-white mb-6">{t("cart.summary", lang)}</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4">
                    <img src={item.image} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price, lang)}</p>
                    </div>
                    <p className="text-sm font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] pt-5 mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                  <span className="font-medium text-white">{formatPrice(totalPrice, lang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("checkout.delivery", lang)}</span>
                  <span className="font-medium text-white">{hasFreeShippingItem ? "FREE" : formatPrice(deliveryRate, lang)}</span>
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
                className="flex-1 py-3.5 glass glass-hover text-gray-300 rounded-full font-semibold transition-all"
              >
                {t("admin.cancel", lang)}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] btn-cyber-solid py-3.5 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("checkout.processing", lang)}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("checkout.confirm", lang)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
