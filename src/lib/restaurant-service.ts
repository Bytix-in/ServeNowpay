import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export interface CreateRestaurantData {
  restaurantName: string
  ownerName: string
  phoneNumber: string
  email: string
  address: string
  cuisineTags: string
  seatingCapacity: string
}

export interface RestaurantCredentials {
  restaurantId: string
  databaseId?: string
  managerUsername: string
  managerPassword: string
  loginUrl: string
}

// Generate a professional and unique slug from restaurant name
function generateSlug(name: string): string {
  // Clean and format the base name
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters but keep spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 25) // Reasonable length limit
  
  // Generate a professional suffix using current timestamp and random component
  const timestamp = Date.now().toString(36) // Base36 timestamp (shorter)
  const randomComponent = Math.random().toString(36).substring(2, 5) // 3 random chars
  
  // Combine for a professional look: restaurant-name-2024a1b2c
  return `${cleanName}-${timestamp}${randomComponent}`
}

// Generate a unique manager username
function generateManagerUsername(restaurantName: string): string {
  const baseUsername = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10)
  
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `mgr_${baseUsername}_${randomSuffix}`
}

// Generate a secure random password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Create restaurant in database
export async function createRestaurant(data: CreateRestaurantData): Promise<RestaurantCredentials> {
  try {
    // Generate credentials with proper UUID
    const restaurantId = generateUUID()
    const customRestaurantId = `REST_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    const managerUsername = generateManagerUsername(data.restaurantName)
    const managerPassword = generatePassword()
    const passwordHash = await hashPassword(managerPassword)
    
    // Generate unique slug with retry mechanism
    let slug = generateSlug(data.restaurantName)
    let attempts = 0
    const maxAttempts = 5
    
    // Check if slug already exists and generate a new one if needed
    while (attempts < maxAttempts) {
      const { data: existingRestaurant } = await supabaseAdmin
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (!existingRestaurant) {
        break // Slug is unique, we can use it
      }
      
      // Generate a new slug with a different random suffix
      slug = generateSlug(data.restaurantName)
      attempts++
    }
    
    const restaurantRecord = {
      id: restaurantId, // Use UUID for database
      name: data.restaurantName,
      slug: slug,
      owner_id: null, // Will be set later when user account is created
      owner_name: data.ownerName,
      phone_number: data.phoneNumber,
      email: data.email,
      address: data.address,
      cuisine_tags: data.cuisineTags,
      seating_capacity: data.seatingCapacity ? parseInt(data.seatingCapacity) : null,
      status: 'active',
      restaurant_username: managerUsername,
      restaurant_password_hash: passwordHash
    }
    
    // Insert restaurant into database
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert(restaurantRecord)
      .select()
      .single()

    if (restaurantError) {
      console.error('Restaurant creation error:', restaurantError)
      throw new Error(`Failed to create restaurant: ${restaurantError.message}`)
    }

    // Return credentials (we'll create the auth user separately in the API route)
    return {
      restaurantId: customRestaurantId, // Return the custom ID for display
      databaseId: restaurantId, // Also return the actual database UUID
      managerUsername,
      managerPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
    }

  } catch (error) {
    console.error('Error creating restaurant:', error)
    throw error
  }
}

// Get all restaurants for admin dashboard
export async function getAllRestaurants() {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    throw error
  }
}

// Get restaurant by ID
export async function getRestaurantById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch restaurant: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    throw error
  }
}

// Update restaurant status
export async function updateRestaurantStatus(id: string, status: 'active' | 'inactive') {
  try {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update restaurant status: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error updating restaurant status:', error)
    throw error
  }
}