import { auth, signOut } from '@/auth'
import Link from 'next/link'

export async function Navbar() {
  let session
  try {
    session = await auth()
  } catch (error) {
    console.error('Navbar auth error:', error)
    session = null
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Sentinel
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/api-docs"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  API Docs
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name || session.user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.role}
                    </p>
                  </div>
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <form action={async () => {
                    'use server'
                    await signOut({ 
                      redirectTo: '/',
                      redirect: true
                    })
                  }}>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <form
                action={async () => {
                  'use server'
                  const { signIn } = await import('@/auth')
                  await signIn('google', { 
                    redirectTo: '/dashboard'
                  })
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
