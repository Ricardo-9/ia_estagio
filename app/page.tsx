'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import RobotAvatar from './components/RobotAvatar'
export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage({ text: 'Preencha email e senha.', error: true })
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage({ text: `Erro: ${error.message}`, error: true })
    } else {
      setMessage({ text: 'Login realizado com sucesso!', error: false })
      router.replace('/chat')
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.replace('/chat')
    }
    checkSession()
  }, [router])
//onClick={() => router.replace('/signup')}
  return (
    <div
      className="h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bgescuro2.png')" }}
    >
      <div className="flex flex-col space-y-4 w-full max-w-sm mx-auto py-44 z-10 relative">
        <div className="">
          <div className="space-x-5 -ml-18">
            <span className="text-7xl font-bold text-white">Welcome</span>
            <span className="text-7xl font-bold text-white">back!</span>
          </div>
          <h2 className="text-xl font-medium text-white mt-2 ml-12">
            Make your login, start meeting
          </h2>
        </div>

        <div className="text-white flex flex-col gap-3 mt-6 max-w-sm">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-3 border-b-2 border-white focus:outline-none focus:border-gray-600 placeholder-white placeholder:font-bold bg-transparent text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-3 border-b-2 border-white focus:outline-none focus:border-gray-600 placeholder-white placeholder:font-bold bg-transparent text-white"
          />
        </div>

        

        

        <br />

        <button
          className="bg-[#a945c8] text-white py-3 px-6 rounded-[60px] font-semibold shadow-md hover:bg-[#dd70ff] transition"
          onClick={handleLogin}
        >
          Log In
        </button>
{message && (
          <p className={`text-center font-semibold ${message.error ? 'text-red-500' : 'text-green-400'}`}>
            {message.text}
          </p>
        )}

        
        
      </div>
      <div className="text-white flex justify-center gap-10 mt-6 text-[16px] font-medium">
          <a
            onClick={() => router.replace('/signup')}
            className="cursor-pointer hover:text-[#dadadb] transition-colors font-bold "
          >
            Create an account
          </a>
          <a
            className="cursor-pointer hover:text-[#dadadb] transition-colors font-bold"
          >
            Forgot Password?
          </a>
        </div>
         
      
    </div>
  )
}