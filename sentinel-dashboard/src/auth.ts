import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { shouldTryDatabase } from "@/lib/db-check"
import type { Role } from "@prisma/client"

if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error("Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET environment variables")
}

if (!process.env.AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET environment variable")
}

// In local/dev, use JWT sessions only to avoid breaking auth if the database
// container or Prisma migrations are not fully set up yet.
// The Prisma adapter is only needed for persistent database sessions.
const shouldUseDatabase = false

// We still keep the types, but always run with JWT sessions for now.
const adapter: ReturnType<typeof PrismaAdapter> | undefined = undefined
const useDatabase = false

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
        const email = session.user.email || (token.email as string) || ""
        const adminEmail = process.env.ADMIN_EMAIL || "dhanushneelakantan2002@gmail.com"
        const role: Role = email === adminEmail ? "ADMIN" : ((token.role as Role) || "USER")

        session.user.id = (token.id as string) || token.sub || email || ""
        session.user.role = role
      }
      return session
    },
    async jwt({ token, user, account }) {
      // For JWT sessions, derive role from email (treat your account as ADMIN in dev)
      const email =
        (user && (user.email as string | null)) ||
        (token.email as string | undefined) ||
        null

      const adminEmail = process.env.ADMIN_EMAIL || "dhanushneelakantan2002@gmail.com"
      const isAdmin = email === adminEmail

      if (!token.id) {
        token.id = (user && (user.id as string | undefined)) || (token.sub as string | undefined) || email || ""
      }

      token.role = (isAdmin ? "ADMIN" : "USER") as Role

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
