'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

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
        router.replace('/chat')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bgclaro2.png')" }}>
      <div className="flex flex-col space-y-4 w-full max-w-sm mx-auto py-34">
        <div>
          <p className="text-7xl font-bold text-[#3a2e2e] whitespace-nowrap -ml-21 py-15 ">Create Account</p>
          <h2 className="text-xl font-medium text-[#5a5a5a] mt-2 ml-12">Register using email and password</h2>
        </div>

        <div className="text-[#333333] flex flex-col gap-3 mt-6 max-w-sm">
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-3 border-b-2 border-[#333333] focus:outline-none focus:border-gray-600 placeholder-[#333333] placeholder:font-bold bg-transparent text-[#333333]"
          />

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-3 border-b-2 border-[#333333] focus:outline-none focus:border-gray-600 placeholder-[#333333] placeholder:font-bold bg-transparent text-[#333333]"
          />
        </div>

        {message && <p className="text-center text-sm text-red-500 mt-4">{message}</p>}

        <button
          className="bg-[#00bfff] text-white py-3 px-6 rounded-[60] font-semibold shadow-md hover:bg-[#5ee7ff] transition"
          onClick={handleSignup}
        >
          Register
        </button>
        
               
      </div>
      
    </div>
  )
}