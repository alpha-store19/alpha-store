"use client"

import { useParams, notFound, useRouter } from "next/navigation"
import { useState } from "react"
import { getProductById } from "@/lib/store"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const product = getProductById(params.id as string)

  if (!product) {
    notFound()
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-[#e94560] transition-colors">{t("nav.home", lang)}</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[#e94560] transition-colors">{t("nav.products", lang)}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up">
        <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg shadow-gray-200/50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-sm text-[#e94560] uppercase tracking-wider font-semibold mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600 font-medium">{t("product.quantity", lang)}</span>
            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 transition-colors text-lg font-medium"
              >
                -
              </button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-gray-100 transition-colors text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 rounded-full font-semibold text-lg transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-[#e94560] hover:bg-[#ff6b81] text-white hover:shadow-lg hover:shadow-[#e94560]/30"
              }`}
            >
              {added ? `✓ ${t("product.added", lang)}` : t("product.addToCart", lang)}
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full font-semibold transition-all"
            >
              {t("product.viewCart", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
