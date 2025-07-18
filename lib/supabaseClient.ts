import { createClient } from "@supabase/supabase-js"
import { auth } from '@clerk/nextjs/server'

export function sdf() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: { schema: 'cutzy' },
        async accessToken() {
          return (await auth()).getToken()
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      },
    )
  }