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
  try {
    const cookieStore = await cookies()
    const token = await cookieStore.get("auth_token")

    if (!token) {
      console.log("getServerSession: No auth_token cookie found")

      // ตรวจสอบ cookies ทั้งหมดที่มี
      const allCookies = await cookieStore.getAll()
      console.log(
        "getServerSession: All cookies:",
        allCookies.map((c) => `${c.name}=${c.value.substring(0, 10)}...`),
      )

      return null
    }

    console.log("getServerSession: Found auth_token cookie, verifying...")
    console.log("getServerSession: Token value length:", token.value.length)
    console.log("getServerSession: Token value preview:", token.value.substring(0, 20) + "...")

    try {
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key"
      console.log(
        "getServerSession: Using JWT_SECRET:",
        jwtSecret.substring(0, 3) + "..." + jwtSecret.substring(jwtSecret.length - 3),
      )

      const verified = verify(token.value, jwtSecret) as User

      console.log("getServerSession: Token verified successfully:", {
        id: verified.id,
        username: verified.username,
        role: verified.role,
      })

      return {
        user: {
          id: verified.id,
          username: verified.username,
          name: verified.name,
          role: verified.role,
        },
      }
    } catch (error) {
      console.error("getServerSession: Token verification error:", error)
      return null
    }
  } catch (error) {
    console.error("getServerSession: Session error:", error)
    return null
  }
}

