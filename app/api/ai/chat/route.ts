import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { message, user_id } = await req.json()

    if (!message || !user_id) {
      return NextResponse.json({ error: 'Mensagem ou usuário faltando' }, { status: 400 })
    }

    // 1. Salvar mensagem do usuário no banco
    await supabase.from('messages').insert({
      user_id,
      role: 'user',
      content: message,
    })

    // 2. Buscar últimas 10 mensagens do usuário (ordenadas por created_at asc)
    const { data: messages, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) throw error

    // 3. Montar prompt para IA, incluindo system prompt fixo e histórico
    const messagesForAI = [
      {
        role: 'system',
        content:
          'Você é um coach pessoal que ajuda o usuário a manter o foco nas metas de saúde, produtividade e aprendizado.',
      },
      ...messages,
    ]

    // 4. Chamar a IA via OpenRouter API (Llama 3)
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

    // 5. Salvar resposta da IA no banco
    await supabase.from('messages').insert({
      user_id,
      role: 'assistant',
      content: reply,
    })

    // 6. Retornar resposta para o frontend
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Intern Error' }, { status: 500 })
  }
}
