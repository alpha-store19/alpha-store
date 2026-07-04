"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Product } from "@/lib/types"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { formatPrice } from "@/lib/currency"

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, recentlyAdded } = useCart()
  const { lang } = useLang()
  const [justAdded, setJustAdded] = useState(false)
  const isAdded = recentlyAdded === product.id || justAdded

  useEffect(() => {
    if (recentlyAdded === product.id) {
      setJustAdded(true)
      const t = setTimeout(() => setJustAdded(false), 1500)
      return () => clearTimeout(t)
    }
  }, [recentlyAdded, product.id])

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
  }

  return (
    <div className={`group glass rounded-2xl overflow-hidden flex flex-col transition-all duration-500 ${
      isAdded ? "animate-pulse-glow cyber-border" : "glass-hover"
    }`}>
      <Link href={`/products/${product.id}`} className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-cyber/20 backdrop-blur-md text-cyber text-xs font-bold px-2.5 py-1 rounded-full border border-cyber/30">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </span>
        )}
        {product.freeShipping && (
          <span className="absolute top-3 right-3 bg-green-500/20 backdrop-blur-md text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/30">
            Free delivery
          </span>
        )}
        {product.quantity <= 0 && (
          <div className="absolute inset-0 bg-dark/70 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-500/20 text-red-400 text-sm font-bold px-4 py-2 rounded-full border border-red-500/30">
              Out of Stock
            </span>
          </div>
        )}
        {isAdded && (
          <div className="absolute inset-0 bg-cyber/10 backdrop-blur-[1px] flex items-center justify-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-cyber/20 border-2 border-cyber flex items-center justify-center animate-scale-in">
              <svg className="w-8 h-8 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-200 hover:text-cyber transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div>
            <span className="text-lg font-bold text-cyber">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-600 line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
          </div>
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
  )
}
