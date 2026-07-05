"use client"

import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"
import EmptyState from "@/components/EmptyState"
import { CartSkeleton } from "@/components/Skeleton"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <CartSkeleton />

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title={t("cart.empty", lang)}
        description={t("cart.empty.desc", lang)}
        action={{ label: t("cart.startShopping", lang), href: "/products" }}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <div className="flex items-center justify-between mb-10 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-white">{t("cart.title", lang)}</h1>
          <p className="text-gray-500 mt-1.5">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/products" className="btn-ghost px-4 py-2 text-sm inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {t("cart.continue", lang)}
          </Link>
          <button
            onClick={clearCart}
            className="btn-ghost px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t("cart.clear", lang)}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <div
              key={item.productId}
              className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4 glass-hover animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-gray-200 hover:text-cyber transition-colors line-clamp-1 text-sm sm:text-base"
                >
                  {item.name}
                </Link>
                <p className="text-cyber font-bold mt-1 text-sm">{formatPrice(item.price, lang)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  title="Decrease"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-8 text-center font-semibold text-white tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  title="Increase"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold text-cyber">{formatPrice(item.price * item.quantity, lang)}</p>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-600 hover:text-red-400 transition-colors ml-1 p-1.5 rounded-full hover:bg-red-500/10"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 lg:sticky lg:top-28 cyber-border animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h2 className="text-xl font-bold text-white mb-6">{t("cart.summary", lang)}</h2>
            <div className="space-y-3 text-sm border-b border-white/[0.06] pb-5 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-400">{t("cart.subtotal", lang)}</span>
                <span className="font-medium text-white">{formatPrice(totalPrice, lang)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("cart.shipping", lang)}</span>
                <span className={`font-medium ${items.some(i => (i as any).freeShipping) ? "text-green-400" : "text-gray-500"}`}>
                  {items.some(i => (i as any).freeShipping) ? "FREE" : t("cart.shippingCalc", lang) || "Calculated at checkout"}
                </span>
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-bold text-white text-lg">{t("cart.total", lang)}</span>
              <span className="font-bold text-xl text-cyber">{formatPrice(totalPrice, lang)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full btn-cyber-solid text-center py-3.5 text-lg font-bold"
            >
              {t("cart.checkout", lang)}
            </Link>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
