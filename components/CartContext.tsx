"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { CartItem } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  recentlyAdded: string | null
}

const defaultContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  recentlyAdded: null,
}

const CartContext = createContext<CartContextType>(defaultContext)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("alpha-cart")
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("alpha-cart", JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
    setRecentlyAdded(item.productId)
    setTimeout(() => setRecentlyAdded(null), 1500)
  }, [])

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, recentlyAdded }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
