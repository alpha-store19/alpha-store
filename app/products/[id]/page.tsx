"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Product } from "@/lib/types"
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
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products?id=${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((data) => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <div className="animate-pulse text-gray-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <svg className="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mb-4">Product not found</h1>
        <Link href="/products" className="text-cyber hover:text-cyber-light font-semibold transition-colors">
          Browse products
        </Link>
      </div>
    )
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
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10">
        <Link href="/" className="hover:text-cyber transition-colors">{t("nav.home", lang)}</Link>
        <span className="text-gray-600">/</span>
        <Link href="/products" className="hover:text-cyber transition-colors">{t("nav.products", lang)}</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-400">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up">
        <div className="glass rounded-2xl overflow-hidden cyber-border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-sm text-cyber uppercase tracking-wider font-semibold mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-cyber">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-600 line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-400 font-medium">{t("product.quantity", lang)}</span>
            <div className="flex items-center glass rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-lg font-medium"
              >
                -
              </button>
              <span className="px-4 py-2 font-medium text-white min-w-[3rem] text-center border-x border-white/[0.06]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
                added
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "btn-cyber-solid"
              }`}
            >
              {added ? `✓ ${t("product.added", lang)}` : t("product.addToCart", lang)}
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="btn-cyber px-6 py-3 text-lg"
            >
              {t("product.viewCart", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
