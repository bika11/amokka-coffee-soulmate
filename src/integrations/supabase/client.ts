import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htgacpgppyjonzwkkntl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2FjcGdwcHlqb256d2trbnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg2ODQ5ODksImV4cCI6MjAyNDI2MDk4OX0.PmWDHoNF4SKrKxkJl9f0CSx0gpWJFzMrNSq_BPEhQYw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})