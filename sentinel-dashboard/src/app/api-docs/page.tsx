import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

interface ApiEndpoint {
  path: string
  method: string
  description: string
  authRequired: boolean
  roleRequired?: string
  category: string
  example?: string
}

const apiEndpoints: ApiEndpoint[] = [
  {
    path: '/api/health',
    method: 'GET',
    description: 'System health check endpoint. Returns system status, database connection, and memory usage.',
    authRequired: false,
    category: 'System',
    example: '/api/health',
  },
  {
    path: '/api/auth/session',
    method: 'GET',
    description: 'Get current user session information including user details and role.',
    authRequired: true,
    category: 'Authentication',
    example: '/api/auth/session',
  },
  {
    path: '/api/auth/test',
    method: 'GET',
    description: 'Test authentication configuration and verify environment variables.',
    authRequired: false,
    category: 'Authentication',
    example: '/api/auth/test',
  },
  {
    path: '/api/auth/debug',
    method: 'GET',
    description: 'Database diagnostics and connection status. Shows table information and connection details.',
    authRequired: false,
    category: 'Diagnostics',
    example: '/api/auth/debug',
  },
  {
    path: '/api/logs',
    method: 'GET',
    description: 'Retrieve security logs with pagination, filtering by severity, user, and date range.',
    authRequired: true,
    category: 'Security',
    example: '/api/logs?page=1&limit=10&severity=ERROR',
  },
  {
    path: '/api/metrics',
    method: 'GET',
    description: 'System metrics including memory usage, database statistics, and performance data. Admin only.',
    authRequired: true,
    roleRequired: 'ADMIN',
    category: 'Monitoring',
    example: '/api/metrics',
  },
]

export default async function ApiDocs() {
  let session
  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'System':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'Authentication':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'Security':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'Monitoring':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'Diagnostics':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const categories = Array.from(new Set(apiEndpoints.map(e => e.category)))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Documentation
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Complete reference for all available API endpoints
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Endpoints</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{apiEndpoints.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Public Endpoints</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiEndpoints.filter(e => !e.authRequired).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Protected Endpoints</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {apiEndpoints.filter(e => e.authRequired).length}
            </p>
          </div>
        </div>

        {/* API Endpoints by Category */}
        {categories.map((category) => {
          const endpoints = apiEndpoints.filter(e => e.category === category)
          const canAccess = (endpoint: ApiEndpoint) => {
            if (!endpoint.authRequired) return true
            if (!session?.user) return false
            if (endpoint.roleRequired) {
              return session.user.role === endpoint.roleRequired
            }
            return true
          }

          return (
            <div key={category} className="mb-8">
              <div className={`rounded-xl border-2 p-6 ${getCategoryColor(category)}`}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">{getCategoryIcon(category)}</span>
                  {category}
                </h2>

                <div className="space-y-4">
                  {endpoints.map((endpoint) => {
                    const accessible = canAccess(endpoint)
                    
                    return (
                      <div
                        key={endpoint.path}
                        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${
                          !accessible ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-3 py-1 rounded-md text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                              <code className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                                {endpoint.path}
                              </code>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {endpoint.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {endpoint.authRequired && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded text-xs font-medium">
                              🔒 Auth Required
                            </span>
                          )}
                          {endpoint.roleRequired && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded text-xs font-medium">
                              👑 {endpoint.roleRequired} Only
                            </span>
                          )}
                          {!endpoint.authRequired && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs font-medium">
                              🌐 Public
                            </span>
                          )}
                        </div>

                        {endpoint.example && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Example:
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                              <code className="text-sm text-gray-700 dark:text-gray-300">
                                http://localhost:3000{endpoint.example}
                              </code>
                            </div>
                          </div>
                        )}

                        {accessible ? (
                          <div className="mt-4">
                            <Link
                              href={endpoint.path}
                              target="_blank"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Try it →
                            </Link>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-2">
                            <span className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                              {!session?.user ? 'Sign in required' : 'Insufficient permissions'}
                            </span>
                            {endpoint.roleRequired && session?.user && (
                              <Link
                                href="/admin/promote"
                                className="ml-2 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm font-medium"
                              >
                                Get Admin Access →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {/* API Usage Guidelines */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📚 API Usage Guidelines
          </h2>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
              <p>
                Protected endpoints require a valid session cookie. Sign in through the dashboard to obtain a session.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rate Limiting</h3>
              <p>
                API endpoints are rate-limited to prevent abuse. Most endpoints allow 30 requests per minute per IP address.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Response Format</h3>
              <p>
                All endpoints return JSON responses. Errors include an error code, message, and request ID for tracing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Base URL</h3>
              <p className="font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                http://localhost:3000
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'System':
      return '⚙️'
    case 'Authentication':
      return '🔐'
    case 'Security':
      return '🛡️'
    case 'Monitoring':
      return '📊'
    case 'Diagnostics':
      return '🔍'
    default:
      return '📡'
  }
}
