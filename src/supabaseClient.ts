import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tgzssgfwpaabceplmrlp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnenNzZ2Z3cGFhYmNlcGxtcmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzg4ODIsImV4cCI6MjA4NjkxNDg4Mn0.Rwxo7ST81jbnAZ_QBdiqDK2MYxAftlKhOSno5UsBssE"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);