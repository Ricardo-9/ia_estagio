import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 })

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? {})
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Usuário não informado' }, { status: 400 })

    const body = await req.json()
    const { age, weight, gender, isStudent, preferences, goals } = body

    // Verificar se já existe perfil para atualizar ou criar novo
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (existingProfile) {
      // Atualizar
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          age,
          weight,
          gender,
          is_student: isStudent,
          preferences,
          goals,
          updated_at: new Date(),
        })
        .eq('user_id', userId)

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    } else {
      // Criar
      const { error: insertError } = await supabase.from('user_profiles').insert({
        user_id: userId,
        age,
        weight,
        gender,
        is_student: isStudent,
        preferences,
        goals,
      })

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
