'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserId } from '@/app/hooks/useUserId'
import { useRouter } from 'next/navigation'
import { FaUser, FaWeight, FaTransgender, FaUserGraduate, FaBullseye, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa'

export default function UserProfile() {
  const userId = useUserId()
  const router = useRouter()

  const [age, setAge] = useState<number | ''>('')
  const [weight, setWeight] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [preferences, setPreferences] = useState<string[]>([])
  const [goals, setGoals] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const preferenceOptions = [
    { value: 'saude', label: 'Saúde' },
    { value: 'academia', label: 'Academia' },
    { value: 'saude_mental', label: 'Saúde Mental' },
    { value: 'produtividade', label: 'Produtividade' },
    { value: 'estudos', label: 'Estudos' },
    { value: 'lazer', label: 'Lazer' },
  ]

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
      body: JSON.stringify({ age, weight, gender, isStudent, preferences, goals }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage({ text: 'Perfil salvo com sucesso!' })
    } else {
      setMessage({ text: data.error || 'Erro ao salvar perfil.', error: true })
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function togglePreference(pref: string) {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref))
    } else {
      setPreferences([...preferences, pref])
    }
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center py-10 px-4 relative"
      style={{
        backgroundImage: "url('/bgescuro2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      
      <main
        className="w-full max-w-2xl p-6 rounded-2xl flex flex-col gap-6 text-white shadow-lg"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
          <FaUser /> Meu Perfil
        </h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="font-semibold flex items-center gap-2"> <FaUser /> Idade </label>
            <input
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Digite sua idade"
              className="w-full px-4 py-2 rounded-xl bg-black/20 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold flex items-center gap-2"> <FaWeight /> Peso (kg) </label>
            <input
              type="number"
              min={0}
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Digite seu peso"
              className="w-full px-4 py-2 rounded-xl bg-black/20 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold flex items-center gap-2"> <FaTransgender /> Sexo </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-black/20 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50"
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="nao_informar">Prefiro não informar</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className="w-5 h-5"
            />
            <label className="font-semibold flex items-center gap-2">
              <FaUserGraduate /> Você estuda?
            </label>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Preferências</h2>
          <div className="grid grid-cols-2 gap-3">
            {preferenceOptions.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition ${
                  preferences.includes(value)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-black/20 border-white/20 text-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={preferences.includes(value)}
                  onChange={() => togglePreference(value)}
                  className="hidden"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold flex items-center gap-2"> <FaBullseye /> Metas / Objetivos </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            placeholder="Descreva suas metas aqui"
            className="w-full px-4 py-2 rounded-xl bg-black/20 border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/50"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={saveProfile}
            disabled={loading}
            className={`w-full py-3 rounded-full font-bold shadow-md transition ${
              loading ? 'bg-gray-500 text-white' : 'bg-[#a945c8] hover:bg-[#7c2199] text-white'
            }`}
          >
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </button>

          

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-md flex items-center justify-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>

          <button
            onClick={() => router.push('/chat')}
            className="w-full py-3 rounded-full font-bold text-white bg-black/20 border border-white/20 hover:bg-black/30 shadow-md flex items-center justify-center gap-2"
          ><FaArrowLeft />
             Voltar ao chat
          </button>
          {message && (
            <p className={`text-center font-bold ${message.error ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </p>
          )}
        </div>
        
    
      </main>
    </div>
  )
}
