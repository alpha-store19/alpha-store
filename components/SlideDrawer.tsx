"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import { Product } from "@/lib/types"
import { formatPrice } from "@/lib/currency"

interface SlideDrawerProps {
  open: boolean
  onClose: () => void
}

type Tab = "menu" | "social" | "products"

export default function SlideDrawer({ open, onClose }: SlideDrawerProps) {
  const { lang } = useLang()
  const dir = getDir(lang)
  const isRtl = dir === "rtl"
  const [tab, setTab] = useState<Tab>("menu")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 6))
          const cats = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean))) as string[]
          setCategories(cats.sort())
        }
      })
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "menu", label: "Menu", icon: "M4 6h16M4 12h16M4 18h16" },
    { key: "social", label: "Social", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { key: "products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  ]

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-dark/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`fixed top-0 ${isRtl ? "left-0" : "right-0"} h-full w-full sm:w-[420px] z-[70] glass border-l border-white/[0.06] shadow-2xl animate-slide-up`}
        dir={dir}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <span className="text-lg font-bold text-white tracking-[0.15em] uppercase">
              <span className="text-cyber">ALPHA</span>
            </span>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex border-b border-white/[0.06]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${
                  tab === t.key
                    ? "text-cyber border-b-2 border-cyber bg-cyber/5"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
            {tab === "menu" && (
              <div className="space-y-1 animate-fade-in">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] text-gray-300 hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyber/10 flex items-center justify-center group-hover:bg-cyber/20 transition-colors">
                    <svg className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{t("nav.home", lang)}</p>
                    <p className="text-xs text-gray-600">Back to homepage</p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] text-gray-300 hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyber/10 flex items-center justify-center group-hover:bg-cyber/20 transition-colors">
                    <svg className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{t("nav.products", lang)}</p>
                    <p className="text-xs text-gray-600">Browse all products</p>
                  </div>
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] text-gray-300 hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyber/10 flex items-center justify-center group-hover:bg-cyber/20 transition-colors">
                    <svg className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{t("nav.cart", lang)}</p>
                    <p className="text-xs text-gray-600">View your cart</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] text-gray-300 hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyber/10 flex items-center justify-center group-hover:bg-cyber/20 transition-colors">
                    <svg className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Orders</p>
                    <p className="text-xs text-gray-600">Track your orders</p>
                  </div>
                </Link>

                <div className="h-px bg-white/[0.06] my-4" />

                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium px-4 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2 px-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={onClose}
                      className="px-3.5 py-1.5 glass rounded-full text-xs text-gray-400 hover:text-cyber hover:border-cyber/30 transition-all"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-white/[0.06] my-4" />

                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium px-4 mb-3">Contact</p>
                <div className="px-4 space-y-2">
                  <a href="tel:+213697029434" className="flex items-center gap-3 text-sm text-gray-400 hover:text-cyber transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0697029434
                  </a>
                  <a href="mailto:alphazaki209@gmail.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-cyber transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    alphazaki209@gmail.com
                  </a>
                </div>
              </div>
            )}

            {tab === "social" && (
              <div className="space-y-3 animate-fade-in">
                <a
                  href="https://wa.me/213697029434"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/[0.04] border border-white/[0.06] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">WhatsApp</p>
                    <p className="text-xs text-gray-500">Chat with us now</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-cyber transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/alpha._store19?igsh=MW04bXRuYXN4MWtrcQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/[0.04] border border-white/[0.06] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                    <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">Instagram</p>
                    <p className="text-xs text-gray-500">@alpha._store19</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-cyber transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/18FZyBXGje/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/[0.04] border border-white/[0.06] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-200">Facebook</p>
                    <p className="text-xs text-gray-500">Alpha Store</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-cyber transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {tab === "products" && (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-4 px-1">Featured Products</p>
                <div className="space-y-2">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-all group"
                    >
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-cyber transition-colors">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                      <p className="text-sm font-bold text-cyber">{formatPrice(p.price, lang)}</p>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="block w-full text-center mt-4 py-3 glass rounded-xl text-sm text-cyber hover:bg-cyber/10 transition-all font-medium"
                >
                  View All Products &rarr;
                </Link>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-white/[0.06]">
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full btn-cyber-solid text-center py-3.5 text-base font-bold"
            >
              Checkout Now
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
