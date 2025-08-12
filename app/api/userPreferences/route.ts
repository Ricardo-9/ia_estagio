import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'User ID missing' }, { status: 400 })

  const { data, error } = await supabase
    .from('user_preferences')
    .select('focus, goals, priority')
    .eq('user_id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || null)
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'User ID missing' }, { status: 400 })

  const { focus, goals, priority } = await req.json()

  // Tenta atualizar se existir, senão insere
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('user_preferences')
      .update({ focus, goals, priority, updated_at: new Date() })
      .eq('user_id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('user_preferences')
      .insert({ user_id: userId, focus, goals, priority })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Preferências salvas com sucesso!' })
}
