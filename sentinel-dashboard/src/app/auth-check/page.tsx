'use client'

import { useEffect, useState } from 'react'

interface AuthCheck {
  status: string
  checks: {
    AUTH_GOOGLE_ID: boolean
    AUTH_GOOGLE_SECRET: boolean
    AUTH_SECRET: boolean
    AUTH_TRUST_HOST: boolean
    AUTH_URL: string
    NODE_ENV: string
  }
  callbackUrl: string
  message: string
}

export default function AuthCheckPage() {
  const [data, setData] = useState<AuthCheck | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/test')
      .then(res => res.json())
      .then((data: AuthCheck) => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch auth check:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Configuration Check</h1>
        <p>Loading...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Configuration Check</h1>
        <p className="text-red-600">Failed to load configuration</p>
      </main>
    )
  }

  const allValid = data.status === 'OK'

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Auth Configuration Check</h1>
      
      <div className={`p-4 rounded mb-6 ${allValid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
        <h2 className={`font-semibold mb-2 ${allValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
          Status: {data.status}
        </h2>
        <p className="text-sm">{data.message}</p>
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="font-semibold">Environment Variables:</h3>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span>AUTH_GOOGLE_ID:</span>
            <span className={data.checks.AUTH_GOOGLE_ID ? 'text-green-600' : 'text-red-600'}>
              {data.checks.AUTH_GOOGLE_ID ? '✓ Set' : '✗ Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>AUTH_GOOGLE_SECRET:</span>
            <span className={data.checks.AUTH_GOOGLE_SECRET ? 'text-green-600' : 'text-red-600'}>
              {data.checks.AUTH_GOOGLE_SECRET ? '✓ Set' : '✗ Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>AUTH_SECRET:</span>
            <span className={data.checks.AUTH_SECRET ? 'text-green-600' : 'text-red-600'}>
              {data.checks.AUTH_SECRET ? '✓ Set' : '✗ Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>AUTH_TRUST_HOST:</span>
            <span className={data.checks.AUTH_TRUST_HOST ? 'text-green-600' : 'text-red-600'}>
              {data.checks.AUTH_TRUST_HOST ? '✓ true' : '✗ false'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>AUTH_URL:</span>
            <span className="text-gray-600 dark:text-gray-400">{data.checks.AUTH_URL || 'Not set'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <h3 className="font-semibold mb-2">Google OAuth Callback URL:</h3>
        <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm break-all">
          {data.callbackUrl}
        </code>
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          Make sure this exact URL is added to your Google Cloud Console OAuth 2.0 Client ID under "Authorized redirect URIs"
        </p>
      </div>

      <div className="mt-6">
        <a 
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  )
}
