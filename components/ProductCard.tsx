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
    <div className="group glass rounded-2xl overflow-hidden flex flex-col glass-hover animate-fade-in-up">
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
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
              })
            }
            className="bg-cyber/10 hover:bg-cyber/20 text-cyber p-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-cyber/10 border border-cyber/20 hover:border-cyber/40"
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
