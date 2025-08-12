import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })
  }, [])

  return userId
}
