"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Product } from "@/lib/types"
import { useCart } from "@/components/CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { formatPrice } from "@/lib/currency"
import { ProductDetailSkeleton } from "@/components/Skeleton"
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
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

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

  if (loading) return <ProductDetailSkeleton />

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" dir={dir}>
        <svg className="w-24 h-24 mx-auto mb-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mb-4">Product not found</h1>
        <Link href="/products" className="text-cyber hover:text-cyber-light font-semibold transition-colors">
          Browse products
        </Link>
      </div>
    )
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const allImages = product.images?.length ? product.images : [product.image]

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
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10 animate-fade-in">
        <Link href="/" className="hover:text-cyber transition-colors">{t("nav.home", lang)}</Link>
        <span className="text-gray-700">/</span>
        <Link href="/products" className="hover:text-cyber transition-colors">{t("nav.products", lang)}</Link>
        <span className="text-gray-700">/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 animate-slide-up">
        <div className="space-y-3">
          <div
            className="relative"
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const diff = touchStart - e.changedTouches[0].clientX
              if (Math.abs(diff) > 50) {
                if (diff > 0 && activeImage < allImages.length - 1) setActiveImage(activeImage + 1)
                if (diff < 0 && activeImage > 0) setActiveImage(activeImage - 1)
              }
            }}
          >
            <button
              onClick={() => setLightbox(true)}
              className="glass rounded-2xl overflow-hidden cyber-border w-full cursor-zoom-in group"
            >
              <img
                src={allImages[activeImage]}
                alt={product.name}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          </div>
          {allImages.length > 1 && (
            <>
              <div className="flex items-center justify-center gap-1.5 mt-3 sm:hidden">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      activeImage === idx ? "bg-cyber w-4" : "bg-white/30"
                    }`}
                  />
                ))}
                <span className="text-[10px] text-gray-600 ml-2">
                  {activeImage + 1}/{allImages.length}
                </span>
              </div>
              <div className="hidden sm:flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                      activeImage === idx
                        ? "border-cyber shadow-lg shadow-cyber/10"
                        : "border-white/[0.06] hover:border-white/[0.2]"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center flex-wrap gap-2.5 mb-3">
            <span className="text-xs text-cyber uppercase tracking-wider font-semibold bg-cyber/10 px-3 py-1 rounded-full border border-cyber/20">
              {product.category}
            </span>
            {discount > 0 && (
              <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 font-semibold">
                -{discount}% OFF
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-500/60" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">(0 reviews)</span>
            <span className="text-gray-700">|</span>
            <span className="text-sm text-gray-500">{product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-cyber">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-600 line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
          </div>

          <p className="text-gray-400 leading-relaxed mb-8 border-l-2 border-cyber/20 pl-4">{product.description}</p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-medium">{t("product.quantity", lang)}</span>
              <div className="flex items-center glass rounded-full overflow-hidden border border-white/[0.06]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.quantity <= 0}
                  className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-lg font-medium disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-5 py-2.5 font-semibold text-white min-w-[3rem] text-center border-x border-white/[0.06] tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  disabled={product.quantity <= 0}
                  className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-lg font-medium disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            {product.freeShipping && (
              <span className="badge-green">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Free delivery
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              disabled={added || product.quantity <= 0}
              className={`flex-1 py-3.5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 ${
                product.quantity <= 0
                  ? "bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed"
                  : added
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 scale-[1.02]"
                  : "btn-cyber-solid shadow-lg shadow-cyber/20 hover:shadow-xl hover:shadow-cyber/30"
              }`}
            >
              {product.quantity <= 0 ? "Out of Stock" : added ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("product.added", lang)}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {t("product.addToCart", lang)}
                </span>
              )}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/cart")}
                className="btn-cyber px-5 sm:px-7 py-3.5 text-base sm:text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </button>
              <a
                href={`https://wa.me/213697029434?text=${encodeURIComponent(`Hi! I'm interested in ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber px-5 sm:px-7 py-3.5 text-base sm:text-lg inline-flex items-center justify-center gap-2 text-green-400 border-green-400/30 hover:bg-green-500/10 hover:text-green-300 hover:border-green-400/60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: "Fast delivery" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Secure checkout" },
                { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Easy returns" },
                { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "24/7 support" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  <span className="text-[11px] text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-20 animate-slide-up">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-8">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Category", value: product.category },
              { label: "Price", value: formatPrice(product.price, lang) },
              { label: "Stock", value: product.quantity > 0 ? `${product.quantity} units` : "Out of stock" },
              { label: "Delivery", value: product.freeShipping ? "Free delivery" : "Calculated at checkout" },
              { label: "Product ID", value: `#${product.id.slice(0, 8)}` },
              { label: "Added", value: new Date(product.createdAt).toLocaleDateString() },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl">
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="text-gray-200 font-medium text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 mb-20 animate-slide-up">
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Customer Reviews</h2>
          <p className="text-gray-500 mb-6">Be the first to review this product</p>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                className="p-1 text-gray-600 hover:text-yellow-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            ))}
          </div>
          <button className="btn-cyber px-6 py-2.5 text-sm">Write a Review</button>
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={allImages[activeImage]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-8 flex gap-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(idx) }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? "border-cyber" : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
