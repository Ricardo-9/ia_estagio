'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserId } from '@/app/hooks/useUserId'
import { useRouter } from 'next/navigation'

export default function UserProfile() {
  const userId = useUserId()
  const router = useRouter()

  // Estado para características pessoais
  const [age, setAge] = useState<number | ''>('')
  const [weight, setWeight] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [isStudent, setIsStudent] = useState(false)

  // Estado para preferências (multi-select)
  const [preferences, setPreferences] = useState<string[]>([])

  // Metas / objetivos
  const [goals, setGoals] = useState('')

  // Estados para UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  // Opções de preferências para múltipla escolha
  const preferenceOptions = [
    { value: 'saude', label: 'Saúde' },
    { value: 'academia', label: 'Academia' },
    { value: 'saude_mental', label: 'Saúde Mental' },
    { value: 'produtividade', label: 'Produtividade' },
    { value: 'estudos', label: 'Estudos' },
    { value: 'lazer', label: 'Lazer' },
  ]

  // Carregar dados do usuário e preferências do backend
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetch('/api/userProfile', { headers: { 'x-user-id': userId } })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setAge(data.age ?? '')
          setWeight(data.weight ?? '')
          setGender(data.gender ?? '')
          setIsStudent(data.isStudent ?? false)
          setPreferences(data.preferences ?? [])
          setGoals(data.goals ?? '')
        }
      })
      .catch(() => setMessage({ text: 'Erro ao carregar dados do perfil', error: true }))
      .finally(() => setLoading(false))
  }, [userId])

  // Salvar dados no backend
  async function saveProfile() {
    if (!userId) {
      setMessage({ text: 'Usuário não autenticado.', error: true })
      return
    }

    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/userProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({
        age,
        weight,
        gender,
        isStudent,
        preferences,
        goals,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      setMessage({ text: 'Perfil salvo com sucesso!' })
    } else {
      setMessage({ text: data.error || 'Erro ao salvar perfil.', error: true })
    }
    setLoading(false)
  }

  // Função logout
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Função para manipular seleção múltipla de preferências
  function togglePreference(pref: string) {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref))
    } else {
      setPreferences([...preferences, pref])
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>Perfil do Usuário</h1>

      <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
        Idade:
        <input
          type="number"
          min={0}
          value={age}
          onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '100%', padding: 8, fontSize: 16, marginTop: 4, marginBottom: 16, borderRadius: 5, border: '1px solid #ccc' }}
          placeholder="Digite sua idade"
        />
      </label>

      <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
        Peso (kg):
        <input
          type="number"
          min={0}
          value={weight}
          onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '100%', padding: 8, fontSize: 16, marginTop: 4, marginBottom: 16, borderRadius: 5, border: '1px solid #ccc' }}
          placeholder="Digite seu peso"
        />
      </label>

      <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
        Sexo:
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          style={{ width: '100%', padding: 8, fontSize: 16, marginTop: 4, marginBottom: 16, borderRadius: 5, border: '1px solid #ccc' }}
        >
          <option value="">Selecione</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
          <option value="nao_informar">Prefiro não informar</option>
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 16, fontWeight: 'bold' }}>
        Você estuda?
        <input
          type="checkbox"
          checked={isStudent}
          onChange={(e) => setIsStudent(e.target.checked)}
          style={{ marginLeft: 10, transform: 'scale(1.2)' }}
        />
      </label>

      <fieldset style={{ marginBottom: 16 }}>
        <legend style={{ fontWeight: 'bold', marginBottom: 8 }}>Preferências (selecione todas que desejar):</legend>
        {preferenceOptions.map(({ value, label }) => (
          <label key={value} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={preferences.includes(value)}
              onChange={() => togglePreference(value)}
              style={{ marginRight: 8, transform: 'scale(1.2)' }}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
        Metas / Objetivos:
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={5}
          placeholder="Descreva suas metas aqui"
          style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 5, border: '1px solid #ccc', resize: 'vertical' }}
        />
      </label>

      <button
        onClick={saveProfile}
        disabled={loading}
        style={{
          marginTop: 24,
          width: '100%',
          padding: 12,
          fontSize: 16,
          backgroundColor: loading ? '#999' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Salvando...' : 'Salvar Perfil'}
      </button>

      {message && (
        <p style={{ marginTop: 16, color: message.error ? 'red' : 'green', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: 40,
          width: '100%',
          padding: 12,
          fontSize: 16,
          backgroundColor: '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Logout
      </button>
    </div>
  )
}
