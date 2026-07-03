import { Lang } from "./translations"

export function formatPrice(amount: number, lang: Lang): string {
  const formatted = Math.round(amount).toLocaleString()
  if (lang === "ar") return `${formatted} د.ج`
  return `${formatted} DZD`
}

export function formatPriceShort(amount: number, lang: Lang): string {
  const formatted = Math.round(amount).toLocaleString()
  if (lang === "ar") return `${formatted} د.ج`
  return `DZD ${formatted}`
}
