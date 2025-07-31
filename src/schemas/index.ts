import { z } from 'zod'

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'restaurant']),
  avatar: z.string().optional(),
  restaurantId: z.string().optional(),
  restaurantSlug: z.string().optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'restaurant']),
  phone: z.string().optional(),
})

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Restaurant schemas
export const restaurantSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  address: z.string().min(5),
  phone: z.string(),
  email: z.string().email(),
  cuisine: z.string(),
  rating: z.number().min(0).max(5),
})

// Menu item schemas
export const menuItemSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  available: z.boolean(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),
  calories: z.number().positive().optional(),
})

export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(2, 'Category is required'),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  allergens: z.array(z.string()),
  calories: z.number().positive().optional(),
})

// Order schemas
export const orderItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
})

export const orderSchema = z.object({
  id: z.number(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  tableNumber: z.number().positive().optional(),
  items: z.array(orderItemSchema),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  tip: z.number().min(0),
  total: z.number().positive(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']),
  orderType: z.enum(['dine_in', 'takeout', 'delivery']),
  notes: z.string().optional(),
  estimatedTime: z.number().positive().optional(),

})

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  tableNumber: z.number().positive().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  orderType: z.enum(['dine_in', 'takeout', 'delivery']),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

// Table schemas
export const tableSchema = z.object({
  id: z.number(),
  number: z.number().positive(),
  capacity: z.number().positive(),
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']),
  location: z.string(),

  currentOrder: z.number().nullable(),
  reservedBy: z.string().nullable(),
  reservedAt: z.string().nullable(),
  lastCleaned: z.string(),
  notes: z.string().optional(),
})

export const createTableSchema = z.object({
  number: z.number().positive('Table number must be positive'),
  capacity: z.number().positive('Capacity must be positive'),
  location: z.string().min(2, 'Location is required'),
})



// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Subscription schemas
export const subscriptionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  planId: z.string(),
  planName: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid']),
  amount: z.number().positive(),
  currency: z.string(),
  interval: z.enum(['month', 'year']),
})

// Type exports
export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type Restaurant = z.infer<typeof restaurantSchema>
export type MenuItem = z.infer<typeof menuItemSchema>
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>
export type Order = z.infer<typeof orderSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type Table = z.infer<typeof tableSchema>
export type CreateTableInput = z.infer<typeof createTableSchema>

export type ContactInput = z.infer<typeof contactSchema>
export type Subscription = z.infer<typeof subscriptionSchema>