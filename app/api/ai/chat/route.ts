import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { message, user_id } = await req.json()

    if (!message || !user_id) {
      return NextResponse.json({ error: 'Mensagem ou usuário faltando' }, { status: 400 })
    }

    
    await supabase.from('messages').insert({
      user_id,
      role: 'user',
      content: message,
    })

  
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (profileError) {
      console.warn('Erro ao buscar perfil do usuário:', profileError.message)
      
    }

   
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })
      .limit(100)

    if (messagesError) throw messagesError

   
    const systemPromptBase = `Você é um coach pessoal que ajuda o usuário, focando em gerenciamento diário, planos de treino, estudo e etc.Mas pode ir ajudando o usuario conforme a necessidade dele`

    const systemPrompt = profile
      ? `${systemPromptBase}
Usuário:
- Idade: ${profile.age ?? 'não informado'}
- Peso: ${profile.weight ?? 'não informado'}
- Sexo: ${profile.gender ?? 'não informado'}
- Estuda: ${profile.is_student ? 'Sim' : 'Não'}
- Preferências: ${profile.preferences?.join(', ') ?? 'não informado'}
- Metas: ${profile.goals ?? 'nenhuma meta definida'}
Seja empático e personalize as respostas com base nessas informações.`
      : systemPromptBase

    const messagesForAI = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

   
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-70b-instruct',
        messages: messagesForAI,
        temperature: 0.7,
      }),
    })

    const data = await res.json()

    const reply = data.choices?.[0]?.message?.content ?? 'Desculpe, não consegui gerar uma resposta.'

    
    await supabase.from('messages').insert({
      user_id,
      role: 'assistant',
      content: reply,
    })

   
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}
