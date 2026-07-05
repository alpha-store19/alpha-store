import Link from "next/link"
import { useLang } from "@/lib/language-context"
import { getDir } from "@/lib/translations"

interface EmptyStateProps {
  icon: "cart" | "products" | "orders" | "search"
  title: string
  description: string
  action?: { label: string; href: string }
}

const icons = {
  cart: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  ),
  products: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  orders: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  search: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { lang } = useLang()
  const dir = getDir(lang)

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center" dir={dir}>
      <div className="w-28 h-28 mx-auto mb-8 text-gray-700 animate-float">{icons[icon]}</div>
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="btn-cyber-solid px-8 py-3 text-base inline-block"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
