import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { StatCard } from '@/components/StatCard'
import Link from 'next/link'

export default async function Dashboard() {
  let session
  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
    redirect('/')
  }

  // If not authenticated, redirect to home
  if (!session?.user) {
    redirect('/')
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'MODERATOR':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'USER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome back, {session.user.name || session.user.email}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(session.user.role || 'USER')}`}>
                {session.user.role || 'USER'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="System Status"
            value="Healthy"
            description="All systems operational"
            icon={
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            }
          />
          <StatCard
            title="Active Sessions"
            value="1"
            description="Current session"
            icon={
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            }
          />
          <StatCard
            title="Security Logs"
            value="Active"
            description="Real-time monitoring"
            icon={
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            }
          />
          <StatCard
            title="Database"
            value="Connected"
            description="PostgreSQL active"
            icon={
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💾</span>
              </div>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Profile
              </h2>
              
              <div className="flex items-center space-x-4 mb-6">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(session.user.role || 'USER')}`}>
                    {session.user.role || 'USER'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {session.user.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* API Endpoints Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  API Endpoints
                </h2>
                <Link
                  href="/api-docs"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View All →
                </Link>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/api/health"
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">/api/health</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">System health and status</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                  </div>
                </Link>

                <Link
                  href="/api/auth/session"
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">/api/auth/session</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current session information</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                  </div>
                </Link>

                <Link
                  href="/api/logs"
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">/api/logs</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Security logs and audit trail</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                  </div>
                </Link>

                {(session.user.role === 'ADMIN' || session.user.role === 'admin') && (
                  <Link
                    href="/api/metrics"
                    className="block p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">/api/metrics</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">System metrics (Admin only)</p>
                      </div>
                      <span className="text-red-600 dark:text-red-400">→</span>
                    </div>
                  </Link>
                )}

                <Link
                  href="/api/auth/debug"
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">/api/auth/debug</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Database diagnostics</p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                  </div>
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/api-docs"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Complete API Documentation →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Session Details Card */}
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Session Details
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-xs text-gray-700 dark:text-gray-300">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
