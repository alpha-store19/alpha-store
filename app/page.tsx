"use client"

import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { getFeaturedProducts, getProducts } from "@/lib/store"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"

export default function HomePage() {
  const featured = getFeaturedProducts()
  const all = getProducts()
  const { lang } = useLang()
  const dir = getDir(lang)

  return (
    <div dir={dir}>
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#e94560] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {t("hero.title", lang)} <span className="text-[#e94560]">Alpha</span> Store
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              {t("hero.subtitle", lang)}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-[#e94560] hover:bg-[#ff6b81] text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-[#e94560]/30 text-lg"
              >
                {t("hero.shop", lang)}
              </Link>
              <Link
                href="#featured"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-3 rounded-full font-semibold transition-all text-lg"
              >
                {t("hero.featured", lang)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t("featured.title", lang)}</h2>
            <p className="text-gray-500 mt-1">{t("featured.subtitle", lang)}</p>
          </div>
          <Link
            href="/products"
            className="text-[#e94560] hover:text-[#ff6b81] font-semibold transition-colors"
          >
            {t("featured.viewAll", lang)} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t("allProducts.title", lang)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {all.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-10 py-3 rounded-full font-semibold transition-all hover:shadow-lg"
            >
              {t("allProducts.browse", lang)}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🚚", title: t("freeShipping", lang), desc: t("freeShipping.desc", lang) },
            { icon: "🔒", title: t("securePayment", lang), desc: t("securePayment.desc", lang) },
            { icon: "↩️", title: t("easyReturns", lang), desc: t("easyReturns.desc", lang) },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
