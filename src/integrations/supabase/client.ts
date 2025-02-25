
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htgacpgppyjonzwkkntl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2FjcGdwcHlqb256d2trbnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDIwOTAsImV4cCI6MjA1MzcxODA5MH0.7cubJomcCG2eF0rv79m67XVQedZQ_NIYbYrY4IbSI2Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
