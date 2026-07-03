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
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("cart.empty", lang)}</h1>
        <p className="text-gray-500 mb-8">{t("cart.empty.desc", lang)}</p>
        <Link
          href="/products"
          className="inline-block bg-[#e94560] hover:bg-[#ff6b81] text-white px-10 py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-[#e94560]/30"
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
          <h1 className="text-3xl font-bold text-gray-900">{t("cart.title", lang)}</h1>
          <p className="text-gray-500 mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          {t("cart.clear", lang)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-4 animate-fade-in-up"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-gray-900 hover:text-[#e94560] transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-[#e94560] font-bold mt-1">{formatPrice(item.price, lang)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="font-bold text-gray-900 w-20 text-right">
                {formatPrice(item.price * item.quantity, lang)}
              </p>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("cart.summary", lang)}</h2>
          <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
              <span className="font-medium">{formatPrice(totalPrice, lang)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("cart.shipping", lang)}</span>
              <span className="font-medium text-green-600">{t("cart.shipping.free", lang)}</span>
            </div>
          </div>
          <div className="flex justify-between mb-6">
            <span className="font-bold text-gray-900">{t("cart.total", lang)}</span>
            <span className="font-bold text-xl text-gray-900">{formatPrice(totalPrice, lang)}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-[#e94560] hover:bg-[#ff6b81] text-white text-center py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-[#e94560]/30"
          >
            {t("cart.checkout", lang)}
          </Link>
          <Link
            href="/products"
            className="block w-full text-center text-gray-500 hover:text-[#e94560] mt-3 text-sm font-medium transition-colors"
          >
            {t("cart.continue", lang)}
          </Link>
        </div>
      </div>
    </div>
  )
}
