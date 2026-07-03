"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Lang } from "./translations"

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  dir: "ltr" | "rtl"
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  dir: "ltr",
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("alpha-lang") as Lang | null
    if (stored && ["en", "fr", "ar"].includes(stored)) {
      setLangState(stored)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    if (mounted) localStorage.setItem("alpha-lang", newLang)
  }

  const dir = lang === "ar" ? "rtl" : "ltr"

  return (
    <LangContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
