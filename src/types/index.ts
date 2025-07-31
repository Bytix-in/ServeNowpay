// Re-export all types from schemas for convenience
export * from '@/schemas'

// Additional utility types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard specific types
export interface DashboardStats {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<any>
  color: string
}

export interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Form state types
export interface FormState {
  isLoading: boolean
  error: string | null
  success: boolean
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark'
  primaryColor: string
  accentColor: string
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<any>
  children?: NavItem[]
  roles?: string[]
}

// Table column types for data tables
export interface TableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

// Filter types
export interface Filter {
  key: string
  label: string
  type: 'select' | 'text' | 'date' | 'number'
  options?: { label: string; value: string }[]
  value?: any
}

// Chart data types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

// Permission types
export type Permission = 
  | 'take_orders'
  | 'manage_tables'
  | 'process_payments'
  | 'manage_menu'
  | 'view_analytics'
  | 'manage_settings'
  | 'manage_billing'

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  restaurant: [
    'take_orders',
    'manage_tables',
    'process_payments',
    'manage_menu',
    'view_analytics',
    'manage_settings'
  ],
  admin: [
    'take_orders',
    'manage_tables',
    'process_payments',
    'manage_menu',
    'view_analytics',
    'manage_settings',
    'manage_billing'
  ]
}

// Status color mappings
export const STATUS_COLORS = {
  // Order statuses
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  
  // Table statuses
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  reserved: 'bg-blue-100 text-blue-800',
  cleaning: 'bg-yellow-100 text-yellow-800',
  
  // Priority levels
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
} as const

// Time formatting utilities
export const TIME_FORMATS = {
  short: 'HH:mm',
  long: 'HH:mm:ss',
  date: 'yyyy-MM-dd',
  datetime: 'yyyy-MM-dd HH:mm',
  relative: 'relative' // for "2 hours ago" format
} as const