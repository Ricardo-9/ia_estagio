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

    // 2. Buscar preferências do usuário
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('focus, goals')
      .eq('user_id', user_id)
      .single()

    if (prefError) {
      console.warn('Erro ao buscar preferências do usuário:', prefError.message)
      // Podemos continuar mesmo sem preferências, usando só o prompt padrão
    }

    // 3. Buscar últimas 100 mensagens do usuário (ordenadas por created_at asc)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })
      .limit(100)

    if (messagesError) throw messagesError

    // 4. Montar prompt para IA
    const systemPromptBase = 'Você é um coach pessoal que ajuda o usuário a manter o foco nas metas de saúde, produtividade e aprendizado.'

    // Adicionar preferências se existirem
    const systemPrompt = preferences
      ? `${systemPromptBase} O foco principal do usuário é: ${preferences.focus}. As metas definidas são: ${preferences.goals || 'nenhuma meta definida'}.`
      : systemPromptBase

    const messagesForAI = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    // 5. Chamar a IA via OpenRouter API (Llama 3)
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

    // 6. Salvar resposta da IA no banco
    await supabase.from('messages').insert({
      user_id,
      role: 'assistant',
      content: reply,
    })

    // 7. Retornar resposta para o frontend
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
  }
}
