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
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4" dir={dir}>
      <div className="glass rounded-2xl px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] uppercase">
            <span className="text-cyber">ALPHA</span>
            <span className="text-white/70"> STORE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-gray-400 hover:text-cyber transition-colors duration-300 relative group">
              {t("nav.home", lang)}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/products" className="text-gray-400 hover:text-cyber transition-colors duration-300 relative group">
              {t("nav.products", lang)}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/cart"
              className="relative flex items-center gap-2 glass glass-hover px-4 py-2 rounded-full text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>{t("nav.cart", lang)}</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-cyber text-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
