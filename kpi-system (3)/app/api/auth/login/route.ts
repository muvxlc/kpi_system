import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createConnection } from "@/lib/db"
import { sign } from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT id, username, password, name, role FROM users WHERE username = ?", [
        username,
      ])

      const users = rows as any[]

      if (users.length === 0) {
        return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
      }

      const user = users[0]
      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
      }

      // สร้าง JWT token
      const token = sign(
        {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1d" },
      )

      // เก็บ token ใน cookie
      const cookieStore = await cookies()
      cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 วัน
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 })
  }
}

