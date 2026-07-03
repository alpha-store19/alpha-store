import { Product } from "./types"
import initialData from "../data/products.json"

let products: Product[] = JSON.parse(JSON.stringify(initialData))

export function getProducts(): Product[] {
  return products
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category)))
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return null
  products[idx] = { ...products[idx], ...updates }
  return products[idx]
}

export function deleteProduct(id: string): boolean {
  const len = products.length
  products = products.filter((p) => p.id !== id)
  return products.length < len
}

export function addProduct(product: Product): Product {
  const newProduct = { ...product, id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }
  products.unshift(newProduct)
  return newProduct
}
