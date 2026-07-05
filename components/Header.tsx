"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import LanguageSwitcher from "./LanguageSwitcher"
import SlideDrawer from "./SlideDrawer"
import { Product } from "@/lib/types"

export default function Header() {
  const { totalItems } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const cats = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean))) as string[]
          setCategories(cats.sort())
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const t = setTimeout(() => {
      fetch("/api/products")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSearchResults(
              data.filter((p: Product) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).slice(0, 6)
            )
          }
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setShowCatMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus()
  }, [searchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <>
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4" dir={dir}>
      <div className="glass rounded-2xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] uppercase flex-shrink-0">
            <span className="text-cyber">ALPHA</span>
            <span className="text-white/70"> STORE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-3 py-2 text-gray-500 hover:text-cyber transition-colors rounded-full hover:bg-white/[0.04] inline-flex items-center gap-1.5"
              title="Menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="sr-only">Menu</span>
            </button>
            <Link href="/" className="px-4 py-2 text-gray-400 hover:text-cyber transition-colors rounded-full hover:bg-white/[0.04]">
              {t("nav.home", lang)}
            </Link>
            <div ref={catRef} className="relative">
              <button
                onClick={() => setShowCatMenu(!showCatMenu)}
                className="px-4 py-2 text-gray-400 hover:text-cyber transition-colors rounded-full hover:bg-white/[0.04] flex items-center gap-1"
              >
                {t("nav.products", lang)}
                <svg className={`w-3 h-3 transition-transform ${showCatMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCatMenu && categories.length > 0 && (
                <div className="absolute top-full mt-2 left-0 glass rounded-2xl p-2 min-w-[200px] cyber-border animate-slide-down shadow-2xl">
                  <Link
                    href="/products"
                    onClick={() => setShowCatMenu(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-cyber hover:bg-white/[0.04] rounded-xl transition-all"
                  >
                    {t("featured.viewAll", lang)}
                  </Link>
                  <div className="h-px bg-white/[0.06] my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={() => setShowCatMenu(false)}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:text-cyber hover:bg-white/[0.04] rounded-xl transition-all"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/dashboard" className="px-4 py-2 text-gray-400 hover:text-cyber transition-colors rounded-full hover:bg-white/[0.04]">
              {t("nav.dashboard", lang)}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex md:hidden btn-ghost p-2.5"
              title="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div ref={searchRef} className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`${t("nav.search", lang) || "Search products..."}`}
                    className="bg-white/[0.06] border border-white/[0.1] rounded-full px-4 py-2 text-sm text-gray-200 placeholder-gray-500 w-48 lg:w-64 focus:border-cyber/30 focus:ring-1 focus:ring-cyber/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]) }}
                    className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 glass rounded-2xl p-2 cyber-border animate-slide-down shadow-2xl overflow-hidden">
                      {searchResults.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.id}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]) }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] rounded-xl transition-all"
                        >
                          <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-200 truncate">{p.name}</p>
                            <p className="text-xs text-cyber">{p.price.toLocaleString()} DZD</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="btn-ghost p-2.5"
                  title="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            <LanguageSwitcher />
            <Link
              href="/cart"
              className="relative flex items-center gap-2 glass glass-hover px-3 sm:px-4 py-2 rounded-full text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="hidden sm:inline">{t("nav.cart", lang)}</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-cyber text-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      </header>
      <SlideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
