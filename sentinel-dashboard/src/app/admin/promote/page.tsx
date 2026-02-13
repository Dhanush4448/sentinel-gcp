import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default async function PromotePage() {
  let session
  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
    redirect('/')
  }

  if (!session?.user) {
    redirect('/')
  }

  // Check if user is already admin
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'admin'
  
  // Only allow admin promotion for specific email
  // Use environment variable for security
  const allowedEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
  const canPromote = allowedEmail && session.user.email === allowedEmail

  async function promoteToAdmin() {
    'use server'
    
    if (!prisma) {
      throw new Error('Database not available')
    }

    try {
      const user = await prisma.user.update({
        where: { email: session!.user.email! },
        data: { role: 'ADMIN' },
      })
      return { success: true, message: 'Successfully promoted to ADMIN' }
    } catch (error) {
      console.error('Promotion error:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Failed to promote' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Promote your account to ADMIN role to access all features
          </p>

          {isAdmin ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-green-900 dark:text-green-400">
                    You already have ADMIN access!
                  </h2>
                  <p className="text-green-700 dark:text-green-300">
                    Your current role: <span className="font-bold">{session.user.role}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/api/metrics"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Access Metrics Endpoint →
                </Link>
              </div>
            </div>
          ) : !canPromote ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-900 dark:text-red-400">
                    Access Restricted
                  </h2>
                  <p className="text-red-700 dark:text-red-300">
                    Admin promotion is only available for authorized accounts.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Your Email:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{session.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Role:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{session.user.role}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
                  Current Status
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{session.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Role:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{session.user.role}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400 mb-2">
                  ⚠️ Important Note
                </h2>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Promoting yourself to ADMIN will give you full access to all system features including:
                </p>
                <ul className="mt-3 space-y-1 text-sm text-yellow-800 dark:text-yellow-300 list-disc list-inside">
                  <li>System metrics endpoint</li>
                  <li>All security logs</li>
                  <li>User management capabilities</li>
                  <li>System configuration access</li>
                </ul>
              </div>

              <form
                action={async () => {
                  'use server'
                  if (!prisma) {
                    throw new Error('Database not available')
                  }
                  
                  const currentSession = await auth()
                  if (!currentSession?.user?.email) {
                    throw new Error('Not authenticated')
                  }
                  
                  // Only allow promotion for authorized email
                  const allowedEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
                  if (!allowedEmail || currentSession.user.email !== allowedEmail) {
                    throw new Error('Admin promotion is restricted to authorized accounts only')
                  }
                  
                  try {
                    await prisma.user.update({
                      where: { email: currentSession.user.email },
                      data: { role: 'ADMIN' },
                    })
                    // Redirect to dashboard after promotion
                    redirect('/dashboard?promoted=true')
                  } catch (error) {
                    console.error('Promotion error:', error)
                    throw error
                  }
                }}
              >
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Promote to ADMIN
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  After promotion, please sign out and sign in again to refresh your session
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Alternative: Use Command Line
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            You can also promote yourself using the command line:
          </p>
          <div className="bg-gray-900 dark:bg-black rounded-lg p-4">
            <code className="text-green-400 text-sm">
              npx ts-node scripts/promote-to-admin.ts YOUR_EMAIL@example.com
            </code>
          </div>
        </div>
      </main>
    </div>
  )
}
