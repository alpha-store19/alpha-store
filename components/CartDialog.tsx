"use client"

import Link from "next/link"
import { useCart } from "./CartContext"
import { useLang } from "@/lib/language-context"
import { getDir } from "@/lib/translations"

export default function CartDialog() {
  const { cartDialog, closeCartDialog } = useCart()
  const { lang } = useLang()
  const dir = getDir(lang)

  if (!cartDialog.open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm animate-fade-in"
      onClick={closeCartDialog}
    >
      <div
        className="glass rounded-3xl p-8 max-w-sm w-full cyber-border animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center animate-scale-in">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {lang === "ar" ? "ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ø¥Ù„Ù‰ Ø§Ù„Ø¹Ø±Ø¨Ø©" : lang === "fr" ? "AjoutÃ© au panier" : "Added to Cart"}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-1">{cartDialog.itemName}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/cart"
            onClick={closeCartDialog}
            className="btn-cyber-solid w-full py-3 text-center rounded-full font-bold"
          >
            {lang === "ar" ? "Ø§Ù„Ø°Ù‡Ø§Ø¨ Ù„Ù„Ø¹Ø±Ø¨Ø©" : lang === "fr" ? "Voir le panier" : "Go to Cart"}
          </Link>
          <button
            onClick={closeCartDialog}
            className="btn-cyber w-full py-3 rounded-full font-semibold"
          >
            {lang === "ar" ? "Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„ØªØ³ÙˆÙ‚" : lang === "fr" ? "Continuer mes achats" : "Continue Shopping"}
          </button>
        </div>
      </div>
    </div>
  )
}
