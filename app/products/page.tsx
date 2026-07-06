"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { Product } from "@/lib/types"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [loaded, setLoaded] = useState(false)
  const { lang } = useLang()
  const dir = getDir(lang)

  useEffect(() => {
    const cached = sessionStorage.getItem("alpha-products")
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (Array.isArray(data)) {
          setProducts(data)
          const cats: string[] = Array.from(new Set(data.map((p) => p.category)))
          setCategories(cats)
          setLoaded(true)
          return
        }
      } catch {}
    }
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const prods: Product[] = Array.isArray(data) ? data : []
        sessionStorage.setItem("alpha-products", JSON.stringify(prods))
        setProducts(prods)
        const cats: string[] = Array.from(new Set(prods.map((p) => p.category)))
        setCategories(cats)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir}>
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white">{t("products.title", lang)}</h1>
        <p className="text-gray-500 mt-2">{t("products.subtitle", lang)}</p>
      </div>

      <div className="mobile-scroll-x flex gap-2 mb-10 pb-2 px-1 -mx-4 sm:mx-0 sm:flex-wrap sm:pb-0 sm:px-0">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === cat
                ? "bg-cyber text-dark shadow-lg shadow-cyber/20"
                : "glass glass-hover text-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
