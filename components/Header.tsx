"use client"

import Link from "next/link"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { t, getDir } from "@/lib/translations"
import LanguageSwitcher from "./LanguageSwitcher"

export default function Header() {
  const { totalItems } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-[#e94560]">ALPHA</span> STORE
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
            <Link href="/" className="hover:text-[#e94560] transition-colors">{t("nav.home", lang)}</Link>
            <Link href="/products" className="hover:text-[#e94560] transition-colors">{t("nav.products", lang)}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>{t("nav.cart", lang)}</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#e94560] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
