import { Product } from "./types"
import initialData from "../data/products.json"
import { loadPersisted, savePersisted, initFromGitHub } from "./persist"

const FILE = "products.json"
const GH_PATH = "data/products.json"

let products: Product[] = loadPersisted<Product[]>(FILE, JSON.parse(JSON.stringify(initialData)))
let initialized = false

async function ensureInit() {
  if (initialized) return
  initialized = true
  products = await initFromGitHub<Product[]>(FILE, products)
}

export async function getProducts(): Promise<Product[]> {
  await ensureInit()
  return products
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await ensureInit()
  return products.find((p) => p.id === id)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await ensureInit()
  return products.filter((p) => p.featured)
}

export async function getCategories(): Promise<string[]> {
  await ensureInit()
  return Array.from(new Set(products.map((p) => p.category)))
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  await ensureInit()
  return products.filter((p) => p.category === category)
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  await ensureInit()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return null
  products[idx] = { ...products[idx], ...updates }
  await savePersisted(FILE, GH_PATH, products)
  return products[idx]
}

export async function deleteProduct(id: string): Promise<boolean> {
  await ensureInit()
  const len = products.length
  products = products.filter((p) => p.id !== id)
  if (products.length < len) {
    await savePersisted(FILE, GH_PATH, products)
    return true
  }
  return false
}

export async function addProduct(product: Product): Promise<Product> {
  await ensureInit()
  const newProduct = {
    ...product,
    id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  }
  products.unshift(newProduct)
  await savePersisted(FILE, GH_PATH, products)
  return newProduct
}
