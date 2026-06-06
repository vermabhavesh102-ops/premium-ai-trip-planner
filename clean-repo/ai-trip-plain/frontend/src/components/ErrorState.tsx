import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ErrorState({
  message,
  showRetry = true,
  onRetry,
}: {
  message: string
  showRetry?: boolean
  onRetry?: () => void
}) {
  const navigate = useNavigate()

  const handleHome = () => {
    navigate('/')
  }

  const handleRetry = () => {
    if (onRetry) return onRetry()
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-[#e5e7eb] p-4">
      <div className="w-full max-w-xl text-center border border-white/10 rounded-2xl bg-white/5 p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{message}</h1>
        <p className="text-slate-300 mb-6">Please try again or go back home.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={handleHome}
            className="px-5 py-2.5 rounded-xl bg-blue-600 border border-blue-600 hover:brightness-110 font-semibold"
          >
            Home
          </button>
          {showRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 font-semibold"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

