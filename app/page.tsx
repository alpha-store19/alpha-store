"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { Product } from "@/lib/types"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [all, setAll] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const { lang } = useLang()
  const dir = getDir(lang)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const products: Product[] = Array.isArray(data) ? data : []
        setAll(products)
        setFeatured(products.filter((p) => p.featured))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  return (
    <div dir={dir}>
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber/10 via-transparent to-dark" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(0,240,255,0.15)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm">
              <span className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
              <span className="text-cyber/80">{t("hero.tagline", lang) || "Premium Selection"}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              {t("hero.title", lang)}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-accent-light">
                Alpha
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg">
              {t("hero.subtitle", lang)}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="btn-cyber-solid px-8 py-3 text-lg"
              >
                {t("hero.shop", lang)}
              </Link>
              <Link
                href="#featured"
                className="btn-cyber px-8 py-3 text-lg"
              >
                {t("hero.featured", lang)}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber/30 to-transparent" />
      </section>

      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white">{t("featured.title", lang)}</h2>
            <p className="text-gray-500 mt-2">{t("featured.subtitle", lang)}</p>
          </div>
          <Link
            href="/products"
            className="btn-cyber px-6 py-2 text-sm"
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

      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-cyber/[0.02] to-dark pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t("allProducts.title", lang)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {all.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="btn-cyber-solid px-10 py-3 text-lg"
            >
              {t("allProducts.browse", lang)}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", title: t("securePayment", lang), desc: t("securePayment.desc", lang) },
            { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", title: t("support.title", lang) || "24/7 Support", desc: t("support.desc", lang) || "Call, WhatsApp, Instagram, or Facebook" },
            { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "100% DZD", desc: "Local pricing in Algerian Dinar" },
          ].map((item) => (
            <div
              key={item.title}
              className="glass rounded-2xl p-8 text-center glass-hover group"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-cyber/10 border border-cyber/20 flex items-center justify-center group-hover:bg-cyber/20 group-hover:border-cyber/40 transition-all duration-300">
                <svg className="w-6 h-6 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
