'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserId } from '../hooks/useUserId'
import { User, Send, Trash2 } from 'lucide-react'

export default function Chat() {
  const userId = useUserId()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clearing, setClearing] = useState(false)

  const [robotState, setRobotState] = useState<'idle' | 'thinking' | 'error' | 'off'>('off')
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

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
          setRobotState('off')
          return
        }
        setChatHistory(data || [])
        setRobotState('idle')
        setLastInteractionTime(Date.now())
      })
  }, [userId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionTime > 30000) {
        setRobotState('off')
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [lastInteractionTime])

  async function sendMessage() {
    if (!message.trim() || !userId) return

    setLoading(true)
    setError('')
    setRobotState('thinking')
    setLastInteractionTime(Date.now())

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
        setRobotState('idle')
      } else {
        setError(data.error || 'Erro ao obter resposta')
        setRobotState('error')
      }
    } catch {
      setError('Erro na conexão')
      setRobotState('error')
    }

    setLoading(false)
    setLastInteractionTime(Date.now())
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
      const { error } = await supabase.from('messages').delete().eq('user_id', userId)

      if (error) {
        setError('Erro ao limpar memória: ' + error.message)
      } else {
        setChatHistory([])
        setRobotState('off')
      }
    } catch {
      setError('Erro na conexão ao limpar memória.')
    }

    setClearing(false)
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center items-start pt-10 px-4 relative"
      style={{
        backgroundImage: "url('/bgescuro2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      
      <button
        aria-label="Perfil do usuário"
        onClick={() => router.push('/preferences')}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-blue-600 transition-colors text-white "
      >
        <User size={85} />
      </button>

      <main
        className="max-w-3xl w-full rounded-[16px] p-6 flex flex-col min-h-[80vh] text-white font-sans shadow-lg"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.15)', 
          backdropFilter: 'blur(12px)', 
        }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          Chat com Memória e Robô Assistente
        </h1>

        <div
          aria-live="polite"
          aria-label="Histórico de mensagens"
          className="flex flex-col flex-grow overflow-y-auto mb-4 p-4 rounded-md max-h-[60vh] scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent scrollbar-thumb-rounded"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.12)', 
            backdropFilter: 'blur(10px)',
          }}
        >
          {chatHistory.length === 0 && (
            <p className="text-gray-300 text-center mt-10">
              Nenhuma mensagem ainda.
            </p>
          )}

          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-2xl max-w-[75%] whitespace-pre-wrap text-white ${
                  msg.role === 'user'
                    ? 'bg-blue-600/80'
                    : 'bg-gray-700/70'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <p
            role="alert"
            className="text-red-500 font-bold mb-4 text-center"
          >
            {error}
          </p>
        )}

       
        <div className="flex items-center gap-3 mb-4">
          <textarea
            rows={1}
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!loading) sendMessage()
              }
            }}
            aria-label="Campo para digitar mensagem"
            className="flex-grow resize-none p-3 rounded-xl bg-black/1 border border-gray-300 text-white text-base focus:outline-none focus:border-gray-500 max-h-24 backdrop-blur-md"
          />

          <button
            onClick={clearMemory}
            disabled={clearing}
            title="Limpar memória"
            className="p-3 rounded-xl bg-red-500 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {clearing ? (
              <span className="text-white text-sm select-none">...</span>
            ) : (
              <Trash2 size={24} className="text-white" />
            )}
          </button>

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            title="Enviar mensagem"
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={24} className="text-white" />
          </button>
        </div>
      </main>
      
    </div>
  )
}
