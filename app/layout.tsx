import type { Metadata } from "next"
import { Inter, Tajawal } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/CartContext"
import { LanguageProvider } from "@/lib/language-context"
import Header from "@/components/Header"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
})

export const metadata: Metadata = {
  title: "Alpha Store - Premium Shopping",
  description: "Discover amazing products at Alpha Store. Quality items at unbeatable prices.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${tajawal.variable}`}>
      <body className="font-sans">
        <LanguageProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <footer className="bg-gray-900 text-white/50 py-10 text-center text-sm">
                <div className="max-w-7xl mx-auto px-4">
                  <p className="text-xl font-bold text-white mb-1 tracking-tight">
                    <span className="text-[#e94560]">ALPHA</span> STORE
                  </p>
                  <p>&copy; {new Date().getFullYear()} Alpha Store. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
