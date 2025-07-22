import { z } from 'zod'

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Dish name is required').max(100, 'Dish name must be less than 100 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than ₹0').max(10000, 'Price must be less than ₹10,000'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  preparation_time: z.coerce.number().min(1, 'Preparation time must be at least 1 minute').max(300, 'Preparation time must be less than 300 minutes')
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

export type MenuItem = MenuItemFormValues & {
  id: string
  restaurant_id: string
  created_at: string
  updated_at: string
}