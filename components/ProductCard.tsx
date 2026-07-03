"use client"

import Link from "next/link"
import { Product } from "@/lib/types"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { formatPrice } from "@/lib/currency"

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { lang } = useLang()

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
      <Link href={`/products/${product.id}`} className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-[#e94560] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-[#e94560] transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price, lang)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(product.originalPrice, lang)}</span>
            )}
          </div>
          <button
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
              })
            }
            className="bg-[#e94560] hover:bg-[#ff6b81] text-white p-2.5 rounded-full transition-all hover:shadow-md hover:shadow-[#e94560]/30"
            title="Add to cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
