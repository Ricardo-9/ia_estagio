'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
export default function HomePage() {
  const router = useRouter()
    const redirectToSignup = () => router.replace('/signup')
 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email.')
      return
    }
    if (!password.trim()) {
      setMessage('Please enter your password.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Success!')
      router.replace('/chat')
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
    <div
      className="h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bgclaro2.png')" }}
    >
      <div className="flex flex-col space-y-4 w-full max-w-sm mx-auto py-34 z-10 relative">
        <div className="">
          <div className="space-x-5 -ml-18">
            <span className="text-7xl font-bold text-[#3a2e2e]">Welcome</span>
            <span className="text-7xl font-bold text-[#3a2e2e]">back!</span>
          </div>
          <h2 className="text-xl font-medium text-[#5a5a5a] mt-2 ml-12">
            LOGIN
          </h2>
        </div>

        <div className="text-[#333333] flex flex-col gap-3 mt-6 max-w-sm">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-3 border-b-2 border-[#333333] focus:outline-none focus:border-gray-600 placeholder-[#333333] placeholder:font-bold bg-transparent text-[#333333]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-3 border-b-2 border-[#333333] focus:outline-none focus:border-gray-600 placeholder-[#333333] placeholder:font-bold bg-transparent text-[#333333]"
          />
        </div>

        

        

        <br />

        <button
          className="bg-[#00bfff] text-white py-3 px-6 rounded-[60px] font-semibold shadow-md hover:bg-[#5ee7ff] transition"
          onClick={handleLogin}
        >
          Log In
        </button>


        {message && <p className="text-center text-sm text-red-500 mt-4">{message}</p>}
      </div>
      <div className="text-[#5a5a5a] flex justify-center gap-10 mt-6 text-sm font-medium">
          <a
            onClick={redirectToSignup}
            className="cursor-pointer hover:text-[#1d4ed8] transition-colors"
          >
            Create an account
          </a>
          
        </div>

    </div>
  )
}