import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export interface User {
  id: number
  username: string
  name: string
  role: string
}

export interface Session {
  user: User
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return null
  }

  try {
    const verified = verify(token.value, process.env.JWT_SECRET || "your-secret-key") as User

    return {
      user: {
        id: verified.id,
        username: verified.username,
        name: verified.name,
        role: verified.role,
      },
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

