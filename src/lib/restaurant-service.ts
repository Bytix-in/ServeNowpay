import { supabase } from './supabase'

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

// Generate a unique slug from restaurant name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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

// Simple hash function for passwords (for demo purposes)
async function simpleHash(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'servenow_salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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
    const passwordHash = await simpleHash(managerPassword)
    
    // Generate slug
    const slug = generateSlug(data.restaurantName)
    
    const restaurantRecord = {
      id: restaurantId, // Use UUID for database
      name: data.restaurantName,
      slug: slug,
      owner_name: data.ownerName,
      phone_number: data.phoneNumber,
      email: data.email,
      address: data.address,
      cuisine_tags: data.cuisineTags,
      seating_capacity: data.seatingCapacity ? parseInt(data.seatingCapacity) : null,
      status: 'active',
      manager_username: managerUsername,
      manager_password_hash: passwordHash
    }
    
    // Insert restaurant into database
    const { data: restaurant, error: restaurantError } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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