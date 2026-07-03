"use client"

import { useState } from "react"
import ProductCard from "@/components/ProductCard"
import { getProducts, getCategories } from "@/lib/store"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"

const products = getProducts()
const categories = getCategories()

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const { lang } = useLang()
  const dir = getDir(lang)

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900">{t("products.title", lang)}</h1>
        <p className="text-gray-500 mt-1">{t("products.subtitle", lang)}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-[#e94560] text-white shadow-md shadow-[#e94560]/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl">{t("products.empty", lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
