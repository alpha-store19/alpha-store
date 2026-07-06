import type { Metadata, Viewport } from "next"
import { Inter, Tajawal } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/CartContext"
import { LanguageProvider } from "@/lib/language-context"
import Header from "@/components/Header"
import SocialButtons from "@/components/SocialButtons"
import BackToTop from "@/components/BackToTop"
import CartDialog from "@/components/CartDialog"
import MobileBottomNav from "@/components/MobileBottomNav"
import TrackingPixels from "@/components/TrackingPixels"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Alpha Store - Premium Shopping",
  description: "Discover amazing products at Alpha Store. Quality items at unbeatable prices.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${tajawal.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <LanguageProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <TrackingPixels />
              <MobileBottomNav />
              <SocialButtons />
              <BackToTop />
              <footer className="relative glass border-t border-white/[0.04] py-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-cyber/5 to-transparent pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center md:text-left">
                      <p className="text-xl font-bold text-white mb-2 tracking-[0.15em] uppercase">
                        <span className="text-cyber">ALPHA</span> STORE
                      </p>
                      <p className="text-gray-500 text-sm">Premium products at unbeatable prices.</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-white font-semibold mb-3">Contact</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Phone: 0697029434</p>
                        <a href="https://wa.me/213697029434" target="_blank" rel="noopener noreferrer" className="block hover:text-cyber transition-colors">
                          WhatsApp: 0697029434
                        </a>
                        <a href="https://www.instagram.com/alpha._store19?igsh=MW04bXRuYXN4MWtrcQ==" target="_blank" rel="noopener noreferrer" className="block hover:text-cyber transition-colors">
                          Instagram: @alpha._store19
                        </a>
                        <a href="https://www.facebook.com/share/18FZyBXGje/" target="_blank" rel="noopener noreferrer" className="block hover:text-cyber transition-colors">
                          Facebook: Alpha Store
                        </a>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <h4 className="text-white font-semibold mb-3">Info</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Secure checkout</p>
                        <p>24/7 Customer support</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.04] pt-6 text-center">
                    <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Alpha Store. All rights reserved.</p>
                  </div>
                </div>
              </footer>
            </div>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
