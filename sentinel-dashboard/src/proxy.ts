import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const nextAuth = NextAuth({
  providers: [Google],
  secret: process.env.AUTH_SECRET,
})

const authFn = nextAuth.auth

// Explicitly named export required by the framework
export function proxy(req: any) {
  if (typeof authFn !== "function") {
    return new Response("Auth Configuration Error", { status: 500 })
  }
  return authFn(req)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
