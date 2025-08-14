'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

  const handleResetRequest = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email.')
      return
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('We sent a link to your email!')
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
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto py-36 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-7xl font-bold text-[#3a2e2e] whitespace-nowrap ml-5 py-15 ">Forgot Password?</p>
          <h2 className="text-lg font-medium text-[#5a5a5a] mt-2">
            Enter your email to reset your password
          </h2>
        </div>

        <div className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-3 border-b-2 border-[#333333] focus:outline-none focus:border-gray-600 placeholder-[#333333] placeholder:font-bold bg-transparent text-[#333333]"
          />

          <button
            onClick={handleResetRequest}
            className="bg-[#00bfff] text-white py-3 px-6 rounded-[60px] font-semibold shadow-md hover:bg-[#5ee7ff] transition"
          >
            Send recovery link
          </button>

          {message && (
            <p className="text-center text-sm text-red-500 mt-2">{message}</p>
          )}
        </div>
      </div>
    
    </div>
  )
}