'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserId } from '../hooks/useUserId'

export default function Chat() {
  const userId = useUserId()
  const router = useRouter()

  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clearing, setClearing] = useState(false)

  // Protege a rota — redireciona se não estiver logado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  // Buscar histórico inicial
  useEffect(() => {
    if (!userId) return

    supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          setError('Erro ao carregar histórico')
          return
        }
        setChatHistory(data || [])
      })
  }, [userId])

  async function sendMessage() {
    if (!message.trim() || !userId) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, user_id: userId }),
      })

      const data = await res.json()

      if (res.ok) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: data.reply },
        ])
        setMessage('')
      } else {
        setError(data.error || 'Erro ao obter resposta')
      }
    } catch {
      setError('Erro na conexão')
    }

    setLoading(false)
  }

  async function clearMemory() {
    if (!userId) {
      setError('Usuário não autenticado.')
      return
    }

    const ok = confirm('Tem certeza que deseja apagar todo o histórico de conversa?')
    if (!ok) return

    setClearing(true)
    setError('')

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', userId)

      if (error) {
        setError('Erro ao limpar memória: ' + error.message)
      } else {
        setChatHistory([])
      }
    } catch (err) {
      setError('Erro na conexão ao limpar memória.')
    }

    setClearing(false)
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Chat com Memória</h1>

      {/* Caixa de mensagens */}
      <div
        style={{
          height: 400,
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 5,
          padding: 10,
          marginBottom: 10,
          backgroundColor: '#000',
          color: '#fff',
        }}
      >
        {chatHistory.length === 0 && <p style={{ color: '#888' }}>Nenhuma mensagem ainda.</p>}
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: msg.role === 'user' ? '#0070f3' : '#e0e0e0',
                color: msg.role === 'user' ? 'white' : 'black',
                padding: '8px 12px',
                borderRadius: 15,
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Campo de texto */}
      <textarea
        rows={4}
        placeholder="Digite sua mensagem..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          fontSize: 16,
          borderRadius: 5,
          border: '1px solid #ccc',
          resize: 'vertical',
        }}
      />

      {/* Botões */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          disabled={loading}
          onClick={sendMessage}
          style={{
            flex: 1,
            padding: 12,
            fontSize: 16,
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>

        <button
          disabled={clearing}
          onClick={clearMemory}
          style={{
            flex: 1,
            padding: 12,
            fontSize: 16,
            backgroundColor: '#f33',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: clearing ? 'not-allowed' : 'pointer',
          }}
        >
          {clearing ? 'Limpando...' : 'Limpar memória'}
        </button>
      </div>
    </main>
  )
}
