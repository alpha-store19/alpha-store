"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { t } from "@/lib/translations"

const navItems = [
  { href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", key: "home" },
  { href: "/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", key: "products" },
  { href: "/cart", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z", key: "cart", badge: true },
  { href: "/dashboard", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", key: "orders" },
]

const callItem = { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", href: "tel:+213697029434", key: "call" }

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { lang } = useLang()

  const isActive = (href: string) => {
    if (href === "/") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[55] md:hidden mobile-bottom-nav animate-slide-up-nav">
      <div className="glass rounded-t-2xl border-t border-white/[0.08] shadow-2xl shadow-black/40 px-1 pt-1.5 pb-1 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all touch-target ${
                  active ? "text-cyber" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d={item.icon} />
                </svg>
                <span className="text-[10px] font-medium">
                  {item.key === "home" ? t("nav.home", lang) : item.key === "products" ? t("nav.products", lang) : item.key === "cart" ? t("nav.cart", lang) : "Orders"}
                </span>
                {item.badge && totalItems > 0 && (
                  <span className="absolute -top-0.5 right-1 bg-cyber text-dark text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
                {active && <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyber rounded-full" />}
              </Link>
            )
          })}
          <a
            href={callItem.href}
            className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all text-green-400 hover:text-green-300 touch-target"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={callItem.icon} />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-ping" />
            </div>
            <span className="text-[10px] font-medium">Call</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
