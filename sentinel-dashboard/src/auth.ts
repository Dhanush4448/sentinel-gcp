import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error("Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET environment variables")
}

if (!process.env.AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET environment variable")
}

// Check if database is available, otherwise use JWT sessions
const useDatabase = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '' && !!prisma

// Initialize adapter if database is available
let adapter: ReturnType<typeof PrismaAdapter> | undefined
if (useDatabase && prisma) {
  try {
    adapter = PrismaAdapter(prisma)
  } catch (error) {
    console.warn("Failed to initialize PrismaAdapter, falling back to JWT sessions:", error)
    adapter = undefined
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: adapter,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account consent", // Force Google to show account selection and consent
          access_type: "offline",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: useDatabase ? "database" : "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user, token }) {
      // Attach user role to session
      if (session.user) {
        if (user) {
          // Database session
          session.user.id = user.id
          session.user.role = (user as { role: Role }).role
        } else if (token) {
          // JWT session (fallback if database not available)
          session.user.id = (token.id as string) || token.sub || ""
          session.user.role = (token.role as Role) || "USER"
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // For JWT sessions, store role in token
      if (user) {
        token.role = (user as { role?: Role })?.role || "USER"
        token.id = user.id
      } else if (account && !token.role) {
        // First time signing in - set default role
        token.role = "USER"
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Log sign-in events for security (non-blocking)
      // Only log if database is available and user_id exists
      if (useDatabase && user.id) {
        try {
          await prisma.securityLog.create({
            data: {
              user_id: user.id,
              action: "USER_SIGNIN",
              tier: "security",
              severity: "INFO",
              metadata: {
                provider: account?.provider,
                email: user.email,
                timestamp: new Date().toISOString(),
              },
            },
          })
        } catch (error) {
          // Don't block sign-in if logging fails
          console.error("Failed to log sign-in event (non-critical):", error)
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/",
    error: "/error",
  },
})

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
    }
  }
}
