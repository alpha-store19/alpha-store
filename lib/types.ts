export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  quantity: number
  featured: boolean
  freeShipping: boolean
  createdAt: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  subtotal?: number
  deliveryRate?: number
  customer: CustomerInfo
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  createdAt: string
}

export interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  province: string
  provinceName?: string
  deliveryRate?: number
  deliveryType?: "home" | "office"
}
