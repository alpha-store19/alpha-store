"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Product } from "@/lib/types"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { formatPrice } from "@/lib/currency"

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem, recentlyAdded } = useCart()
  const { lang } = useLang()
  const [justAdded, setJustAdded] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hoverImgIdx, setHoverImgIdx] = useState(-1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isAdded = recentlyAdded === product.id || justAdded
  const images = product.images?.length ? product.images : [product.image]
  const hasMulti = images.length > 1

  useEffect(() => {
    if (recentlyAdded === product.id) {
      setJustAdded(true)
      const t = setTimeout(() => setJustAdded(false), 1500)
      return () => clearTimeout(t)
    }
  }, [recentlyAdded, product.id])

  const startRotation = () => {
    if (!hasMulti || product.quantity <= 0) return
    let i = 0
    intervalRef.current = setInterval(() => {
      i = (i + 1) % images.length
      setHoverImgIdx(i)
    }, 1200)
  }

  const stopRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHoverImgIdx(-1)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const displayImage = hoverImgIdx >= 0 ? images[hoverImgIdx] : product.image
  const showIndicators = hasMulti && (hoverImgIdx >= 0 || false)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <div
      className={`group glass rounded-2xl overflow-hidden flex flex-col transition-all duration-500 animate-slide-up ${
        isAdded ? "!border-cyber/40 !shadow-cyber/10" : "glass-hover"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={startRotation}
      onMouseLeave={stopRotation}
    >
      <Link href={`/products/${product.id}`} className="relative overflow-hidden aspect-square bg-dark-card">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge-cyber animate-fade-in z-20">
            -{discount}%
          </span>
        )}
        {product.freeShipping && !product.originalPrice && (
          <span className="absolute top-3 right-3 badge-green animate-fade-in z-20">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Free
          </span>
        )}
        {product.freeShipping && discount > 0 && (
          <span className="absolute top-3 right-3 badge-green animate-fade-in z-20">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Free
          </span>
        )}
        {product.quantity <= 0 && (
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="badge-red text-sm px-4 py-2">Out of Stock</span>
          </div>
        )}
        {isAdded && (
          <div className="absolute inset-0 bg-cyber/10 backdrop-blur-[1px] flex items-center justify-center animate-fade-in z-20">
            <div className="w-14 h-14 rounded-full bg-cyber/20 border-2 border-cyber flex items-center justify-center animate-scale-in">
              <svg className="w-7 h-7 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 bg-dark/40 backdrop-blur-sm rounded-full py-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick view
          </div>
        </div>

        {hasMulti && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  hoverImgIdx === i || (hoverImgIdx < 0 && i === 0)
                    ? "bg-cyber w-3"
                    : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{product.category}</span>
          {product.quantity > 0 && product.quantity <= 3 && (
            <span className="text-[10px] text-yellow-500/80 font-medium">{product.quantity} left</span>
          )}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-200 hover:text-cyber transition-colors mb-2 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3 text-yellow-500/60" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[10px] text-gray-600 ml-1">(0)</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyber">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-600 line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={`https://wa.me/213697029434?text=${encodeURIComponent(`Hi! I'm interested in ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-green-400/60 hover:text-green-400 hover:bg-green-500/10 transition-all hidden sm:flex"
              title="Ask on WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <button
              onClick={handleAdd}
              disabled={isAdded || product.quantity <= 0}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isAdded
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 scale-110"
                  : product.quantity <= 0
                  ? "bg-gray-500/10 text-gray-600 border border-gray-500/20 cursor-not-allowed"
                  : "bg-cyber/10 hover:bg-cyber/20 text-cyber hover:shadow-lg hover:shadow-cyber/10 border border-cyber/20 hover:border-cyber/40 hover:scale-105 active:scale-95"
              }`}
              title={product.quantity <= 0 ? "Out of stock" : "Add to cart"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAdded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
