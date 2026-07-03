"use client"

import { useLang } from "@/lib/language-context"
import { Lang } from "@/lib/translations"

const labels: Record<Lang, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
}

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const langs: Lang[] = ["en", "fr", "ar"]

  return (
    <div className="flex items-center gap-0.5 glass rounded-full p-0.5">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
            lang === l
              ? "bg-cyber text-dark shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  )
}
