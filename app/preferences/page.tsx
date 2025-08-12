'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserId } from '@/app/hooks/useUserId'

export default function Preferences() {
  const userId = useUserId()
  const [focus, setFocus] = useState('estudos')
  const [goals, setGoals] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  // Carregar preferências ao montar componente
  useEffect(() => {
    if (!userId) return
    setLoading(true)

    fetch('/api/userPreferences', { headers: { 'x-user-id': userId } })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFocus(data.focus || 'estudos')
          setGoals(data.goals || '')
        }
      })
      .catch(() => {
        setMessage({ text: 'Erro ao carregar preferências', error: true })
      })
      .finally(() => setLoading(false))
  }, [userId])

  // Salvar preferências no backend
  async function savePreferences() {
    if (!userId) {
      setMessage({ text: 'Usuário não autenticado.', error: true })
      return
    }
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/userPreferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ focus, goals }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage({ text: 'Preferências salvas com sucesso!' })
    } else {
      setMessage({ text: data.error || 'Erro ao salvar preferências.', error: true })
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>Defina suas preferências e metas</h1>

      <label htmlFor="focus" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
        Foco principal:
      </label>
      <select
        id="focus"
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
        style={{ width: '100%', padding: 8, fontSize: 16, marginBottom: 20, borderRadius: 5, border: '1px solid #ccc' }}
      >
        <option value="estudos">Estudos</option>
        <option value="saude">Saúde</option>
        <option value="academia">Academia</option>
        <option value="saude_mental">Saúde Mental</option>
        <option value="produtividade">Produtividade</option>
        <option value="lazer">Lazer</option>
      </select>

      <label htmlFor="goals" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
        Metas / Objetivos:
      </label>
      <textarea
        id="goals"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        rows={5}
        placeholder="Descreva suas metas aqui"
        style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 5, border: '1px solid #ccc', resize: 'vertical' }}
      />

      <button
        onClick={savePreferences}
        disabled={loading}
        style={{
          marginTop: 24,
          width: '100%',
          padding: 12,
          fontSize: 16,
          backgroundColor: loading ? '#000000ff' : '#0070f3',
          color: loading ? '#666' : 'white',
          border: 'none',
          borderRadius: 5,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Salvando...' : 'Salvar Preferências'}
      </button>

      {message && (
        <p style={{ marginTop: 16, color: message.error ? 'red' : 'green', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
