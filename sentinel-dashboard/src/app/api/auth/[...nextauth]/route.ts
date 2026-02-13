import { handlers } from "@/auth"

// Explicitly use Node.js runtime (not Edge) for NextAuth
export const runtime = "nodejs"

export const { GET, POST } = handlers
