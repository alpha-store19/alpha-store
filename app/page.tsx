"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import { HomeSkeleton } from "@/components/Skeleton"
import { Product } from "@/lib/types"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [all, setAll] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const { lang } = useLang()
  const dir = getDir(lang)

  useEffect(() => {
    const cached = sessionStorage.getItem("alpha-products")
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (Array.isArray(data)) {
          setAll(data)
          setFeatured(data.filter((p) => p.featured))
          const cats = Array.from(new Set(data.map((p) => p.category).filter(Boolean))) as string[]
          setCategories(cats.slice(0, 6))
          setLoaded(true)
          return
        }
      } catch {}
    }
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const products: Product[] = Array.isArray(data) ? data : []
        sessionStorage.setItem("alpha-products", JSON.stringify(products))
        setAll(products)
        setFeatured(products.filter((p) => p.featured))
        const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]
        setCategories(cats.slice(0, 6))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded) return <HomeSkeleton />

  return (
    <div dir={dir}>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.08] via-dark to-dark" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(0,240,255,0.2)_0%,_transparent_60%)] md:opacity-30" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_70%_20%,_rgba(124,58,237,0.12)_0%,_transparent_50%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyber/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm border border-cyber/10">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-cyber opacity-75" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-cyber" />
                </span>
                <span className="text-cyber/80 font-medium">{t("hero.tagline", lang) || "Premium Selection"}</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 text-balance">
                {t("hero.title", lang)}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber via-cyber-light to-accent-light">
                  Alpha
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                {t("hero.subtitle", lang)}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="btn-cyber-solid px-8 py-3.5 text-lg inline-flex items-center gap-2 group"
                >
                  {t("hero.shop", lang)}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="#featured"
                  className="btn-cyber px-8 py-3.5 text-lg"
                >
                  {t("hero.featured", lang)}
                </Link>
              </div>
            </div>
            <div className="hidden md:block animate-fade-in">
              <div className="relative">
                <div className="aspect-square max-w-md mx-auto glass rounded-3xl p-8 cyber-border">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyber/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-6xl md:text-7xl font-bold tracking-[0.2em] uppercase">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-accent-light">
                          ALPHA
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 tracking-[0.3em] uppercase mt-3 font-light">
                        Premium Store
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 animate-float" style={{ animationDelay: "0.5s" }}>
                  <p className="text-xs text-gray-500">Free delivery</p>
                  <p className="text-sm font-bold text-cyber">On all orders</p>
                </div>
                <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 animate-float" style={{ animationDelay: "1s" }}>
                  <p className="text-xs text-gray-500">100% secure</p>
                  <p className="text-sm font-bold text-green-400">Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber/30 to-transparent" />
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10 animate-slide-up">
            <h2 className="section-title">{t("featured.title", lang) || "Shop by Category"}</h2>
            <p className="section-subtitle">{t("featured.subtitle", lang) || "Find what you need"}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="glass glass-hover rounded-full px-6 py-3 text-sm font-medium text-gray-300 hover:text-cyber transition-all animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {cat}
              </Link>
            ))}
            <Link
              href="/products"
              className="btn-cyber rounded-full px-6 py-3 text-sm animate-slide-up"
              style={{ animationDelay: `${categories.length * 80}ms` }}
            >
              {t("featured.viewAll", lang) || "View All"} &rarr;
            </Link>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10 animate-slide-up">
            <div>
              <h2 className="section-title">{t("featured.title", lang)}</h2>
              <p className="section-subtitle">{t("featured.subtitle", lang)}</p>
            </div>
            <Link href="/products" className="btn-cyber px-5 py-2 text-sm hidden sm:inline-flex items-center gap-1">
              {t("featured.viewAll", lang)} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {all.length > 0 && (
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-cyber/[0.02] to-dark pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="section-title">{t("allProducts.title", lang)}</h2>
              <p className="section-subtitle">{t("allProducts.subtitle", lang) || "Discover our latest arrivals"}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {all.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <div className="text-center mt-14">
              <Link
                href="/products"
                className="btn-cyber-solid px-10 py-3.5 text-lg inline-flex items-center gap-2 group"
              >
                {t("allProducts.browse", lang)}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14 animate-slide-up">
          <h2 className="section-title">Why Alpha Store?</h2>
          <p className="section-subtitle">We deliver quality and trust</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", title: t("securePayment", lang) || "Secure Payment", desc: t("securePayment.desc", lang) || "Your data is protected", color: "from-cyber/20 to-cyan-500/10" },
            { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", title: t("support.title", lang) || "24/7 Support", desc: t("support.desc", lang) || "Call, WhatsApp, Instagram, or Facebook", color: "from-accent/20 to-purple-500/10" },
            { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "100% DZD", desc: "Local pricing in Algerian Dinar", color: "from-green-500/20 to-emerald-500/10" },
            { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", title: "Fast Delivery", desc: "Nationwide shipping across Algeria", color: "from-cyber/20 to-cyan-500/10" },
          ].map((item, i) => (
            <div
              key={item.title}
              className="glass rounded-2xl p-7 text-center glass-hover group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.color} border border-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
