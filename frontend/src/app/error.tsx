'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">오류</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-8">죄송합니다. 일시적인 오류가 발생했습니다.</p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
