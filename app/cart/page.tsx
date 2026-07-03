"use client"

import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <svg className="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mb-4">{t("cart.empty", lang)}</h1>
        <p className="text-gray-500 mb-8">{t("cart.empty.desc", lang)}</p>
        <Link
          href="/products"
          className="btn-cyber-solid px-10 py-3 text-lg inline-block"
        >
          {t("cart.startShopping", lang)}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white">{t("cart.title", lang)}</h1>
          <p className="text-gray-500 mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-gray-500 hover:text-cyber text-sm font-medium transition-colors"
        >
          {t("cart.clear", lang)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="glass rounded-2xl p-4 flex items-center gap-4 glass-hover animate-fade-in-up"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-gray-200 hover:text-cyber transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-cyber font-bold mt-1">{formatPrice(item.price, lang)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  +
                </button>
              </div>
              <p className="font-bold text-cyber w-20 text-right">
                {formatPrice(item.price * item.quantity, lang)}
              </p>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-600 hover:text-cyber transition-colors ml-2"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 h-fit sticky top-28 cyber-border">
          <h2 className="text-xl font-bold text-white mb-4">{t("cart.summary", lang)}</h2>
          <div className="space-y-3 text-sm border-b border-white/[0.06] pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">{t("cart.subtotal", lang)}</span>
              <span className="font-medium text-white">{formatPrice(totalPrice, lang)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("cart.shipping", lang)}</span>
              <span className="font-medium text-cyber">500 DZD</span>
            </div>
          </div>
          <div className="flex justify-between mb-6">
            <span className="font-bold text-white">{t("cart.total", lang)}</span>
            <span className="font-bold text-xl text-cyber">{formatPrice(totalPrice, lang)}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full btn-cyber-solid text-center py-3 text-lg"
          >
            {t("cart.checkout", lang)}
          </Link>
          <Link
            href="/products"
            className="block w-full text-center text-gray-500 hover:text-cyber mt-3 text-sm font-medium transition-colors"
          >
            {t("cart.continue", lang)}
          </Link>
        </div>
      </div>
    </div>
  )
}
