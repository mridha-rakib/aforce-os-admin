export type UserStatus = 'Active' | 'Blocked'
export type SubscriptionType = 'Free' | 'Pro' | 'Enterprise'

export interface User {
  id: string
  name: string
  email: string
  hydrationScore: number
  subscription: SubscriptionType
  status: UserStatus
  joinDate: string
  avatar?: string
}

export interface UserDetails extends User {
  appleSubject?: string
  country?: string
  createdAt: string
  dateOfBirth?: string
  displayName?: string
  emailVerifiedAt?: string
  firstName?: string
  googleId?: string
  hasPassword: boolean
  lastName?: string
  providers: {
    apple: boolean
    google: boolean
    password: boolean
  }
  role: 'admin' | 'user'
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: 'Active' | 'Inactive'
  image?: string
  description?: string
  benefits?: string[]
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  amount: number
  status: 'Processing' | 'Shipped' | 'Pending' | 'Delivered' | 'Cancelled'
  date: string
  placedAt?: string
  customerSince?: string
  ordersTotal?: number
  paymentMethod?: string
  paymentAuthorizedAt?: string
  shippingAddress?: string[]
  customerAvatar?: string
  items?: OrderItem[]
  shippingAmount?: number
}

export interface OrderItem {
  id: string
  name: string
  qty: number
  price: number
  image?: string
}

export interface ContentItem {
  id: string
  title: string
  subtitle?: string
  type: 'Video' | 'Article' | 'Tip'
  category: string
  status: 'Published' | 'Draft' | 'Archived'
  createdAt: string
  mediaKey?: string
  mediaName?: string
  mediaType?: string
  mediaUrl?: string
  thumbnail?: string
  thumbnailKey?: string
  updatedAt?: string
}

export interface DashboardStat {
  title: string
  value: string
  trend: string
  accent?: 'green' | 'blue'
}

export interface TrendPoint {
  day: string
  hydration: number
  previous?: number
  logs?: number
  intake?: number
  checkins?: number
}
