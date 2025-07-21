import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase credentials - replace with environment variables in production
const supabaseUrl = 'https://qlvrvlrrqerzemmujyva.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdnJ2bHJycWVyemVtbXVqeXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODM1NTUsImV4cCI6MjA2ODY1OTU1NX0.iKkbtTChuT11VvXwUy8lMC9JIxd4ve6GD7CDPmzjeH8'

// For development purposes, we're using hardcoded values
// In production, you should use environment variables:
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          updated_at?: string
        }
      }
    }
  }
}