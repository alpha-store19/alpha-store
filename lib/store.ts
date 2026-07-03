import { Product } from "./types"
import fs from "fs"
import path from "path"
import initialData from "../data/products.json"

const TMP_PATH = path.join("/tmp", "products.json")
const DATA_PATH = path.join(process.cwd(), "data", "products.json")

function loadProducts(): Product[] {
  try {
    if (fs.existsSync(TMP_PATH)) {
      const data = fs.readFileSync(TMP_PATH, "utf-8")
      return JSON.parse(data)
    }
  } catch {}
  return JSON.parse(JSON.stringify(initialData))
}

function saveProducts(data: Product[]) {
  try {
    fs.writeFileSync(TMP_PATH, JSON.stringify(data, null, 2))
  } catch {}
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
  } catch {}
}

let products: Product[] = loadProducts()

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
  saveProducts(products)
  return products[idx]
}

export function deleteProduct(id: string): boolean {
  const len = products.length
  products = products.filter((p) => p.id !== id)
  if (products.length < len) {
    saveProducts(products)
    return true
  }
  return false
}

export function addProduct(product: Product): Product {
  const newProduct = {
    ...product,
    id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  }
  products.unshift(newProduct)
  saveProducts(products)
  return newProduct
}
