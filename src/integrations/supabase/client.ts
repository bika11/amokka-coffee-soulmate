import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htgacpgppyjonzwkkntl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2FjcGdwcHlqb256d2trbnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY1MzE0NDAsImV4cCI6MjAyMjEwNzQ0MH0.OoqQJjqJP7jXz_YhXUVRxhPEtqEYNQQDWs_00qZQJYI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
})