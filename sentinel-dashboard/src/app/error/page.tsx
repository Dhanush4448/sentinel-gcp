'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An unknown error occurred'

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
      
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded mb-6">
        <p className="text-red-800 dark:text-red-200">{message}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Common Solutions:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>Verify your environment variables are set correctly</li>
            <li>Check that your Google OAuth callback URL is configured</li>
            <li>Ensure your dev server has been restarted after changing .env files</li>
            <li>Visit <Link href="/auth-check" className="text-blue-600 hover:underline">/auth-check</Link> to see detailed configuration status</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Try Again
          </Link>
          <Link 
            href="/auth-check"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Check Configuration
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
