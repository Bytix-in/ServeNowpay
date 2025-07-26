import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Restaurant login endpoint
export async function POST(request: NextRequest) {
    try {
        const { username, password, action } = await request.json()

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        if (action === 'login') {
            // Query the restaurants table for the username
            const { data: restaurant, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('restaurant_username', username.trim())
                .eq('status', 'active')
                .single()

            if (error || !restaurant) {
                return NextResponse.json(
                    { error: 'Invalid username or password' },
                    { status: 401 }
                )
            }

            // Check if restaurant has credentials set up
            if (!restaurant.restaurant_password_hash) {
                return NextResponse.json(
                    { error: 'Restaurant login not configured. Please contact your administrator.' },
                    { status: 401 }
                )
            }

            const isPasswordValid = await bcrypt.compare(password, restaurant.restaurant_password_hash)

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Invalid username or password' },
                    { status: 401 }
                )
            }

            // Update restaurant login status
            try {
                const sessionToken = crypto.randomBytes(32).toString('hex')
                
                // Update restaurant with login status
                await supabase
                    .from('restaurants')
                    .update({
                        last_login_at: new Date().toISOString(),
                        is_logged_in: true,
                        login_session_token: sessionToken
                    })
                    .eq('id', restaurant.id)

                // Return restaurant information
                return NextResponse.json({
                    user: {
                        id: restaurant.id,
                        email: restaurant.email,
                        role: 'restaurant',
                        name: restaurant.name,
                        restaurantId: restaurant.id,
                        restaurantSlug: restaurant.slug
                    },
                    restaurant: {
                        id: restaurant.id,
                        name: restaurant.name,
                        slug: restaurant.slug,
                        address: restaurant.address,
                        phone_number: restaurant.phone_number,
                        email: restaurant.email,
                        cuisine_tags: restaurant.cuisine_tags,
                        seating_capacity: restaurant.seating_capacity,
                        status: restaurant.status,
                        owner_name: restaurant.owner_name
                    },
                    sessionToken,
                    message: 'Login successful'
                })
            } catch (sessionError) {
                console.error('Error updating restaurant login status:', sessionError)
                // Still return success even if session update fails
                return NextResponse.json({
                    user: {
                        id: restaurant.id,
                        email: restaurant.email,
                        role: 'restaurant',
                        name: restaurant.name,
                        restaurantId: restaurant.id,
                        restaurantSlug: restaurant.slug
                    },
                    restaurant: {
                        id: restaurant.id,
                        name: restaurant.name,
                        slug: restaurant.slug,
                        address: restaurant.address,
                        phone_number: restaurant.phone_number,
                        email: restaurant.email,
                        cuisine_tags: restaurant.cuisine_tags,
                        seating_capacity: restaurant.seating_capacity,
                        status: restaurant.status,
                        owner_name: restaurant.owner_name
                    },
                    message: 'Login successful'
                })
            }
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Restaurant auth error:', error)
        return NextResponse.json(
            { error: 'Authentication failed. Please try again.' },
            { status: 500 }
        )
    }
}

// Restaurant logout endpoint
export async function DELETE(request: NextRequest) {
    try {
        const { restaurantId, sessionToken } = await request.json()

        if (restaurantId) {
            // Update restaurant logout status
            await supabase
                .from('restaurants')
                .update({
                    is_logged_in: false,
                    login_session_token: null
                })
                .eq('id', restaurantId)
        }

        return NextResponse.json({ message: 'Restaurant logged out successfully' })
    } catch (error) {
        console.error('Restaurant logout error:', error)
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        )
    }
}