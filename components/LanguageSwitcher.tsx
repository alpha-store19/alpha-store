"use client"

import { useLang } from "@/lib/language-context"
import { Lang } from "@/lib/translations"

const flags: Record<Lang, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  ar: "🇩🇿",
}

const labels: Record<Lang, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
}

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const langs: Lang[] = ["en", "fr", "ar"]

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            lang === l
              ? "bg-accent text-white shadow"
              : "text-white/70 hover:text-white"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  )
}
