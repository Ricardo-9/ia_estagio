'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import {FaArrowLeft} from 'react-icons/fa'
export default function SignupEmailPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage('Please enter both email and password.')
      return
    }
    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Registration completed! Check your email to confirm.')
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/dashboard')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bgescuro2.png')" }}>
      
      <div className="flex flex-col space-y-4 w-full max-w-sm mx-auto py-40">
        <div>
          <p className="text-7xl font-bold text-white whitespace-nowrap -ml-21 py-15 ">Create Account</p>
          <h2 className="text-xl font-medium text-white mt-2 ml-7">Register using email and password</h2>
        </div>

        <div className="text-white flex flex-col gap-3 mt-6 max-w-sm">
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-3 border-b-2 border-white focus:outline-none focus:border-gray-600 placeholder-white placeholder:font-bold bg-transparent text-white"
          />

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-3 border-b-2 border-white focus:outline-none focus:border-gray-600 placeholder-white placeholder:font-bold bg-transparent text-white"
          />
        </div><br></br>
        
        

        

        <button
          className="bg-[#a945c8] text-white py-3 px-6 rounded-[60px] font-semibold shadow-md hover:bg-[#dd70ff] transition"
          onClick={handleSignup}
        >
          Register
        </button>
      
        <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-full font-bold text-white bg-black/20 border border-white/20 hover:bg-black/30 shadow-md flex items-center justify-center gap-2"
          ><FaArrowLeft />
             Voltar
          </button>
        <br></br><br></br><br></br><br></br><br></br><br></br>
        {message && (
          <p className={`text-center font-semibold ${message ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
        
               
      </div>
      
    </div>
  )
}