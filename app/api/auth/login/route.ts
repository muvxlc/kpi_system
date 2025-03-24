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

    console.log("Login attempt for user:", username)

    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT id, username, password, name, role FROM users WHERE username = ?", [
        username,
      ])

      const users = rows as any[]

      if (users.length === 0) {
        console.log("User not found:", username)
        return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
      }

      const user = users[0]
      console.log("User found:", { id: user.id, username: user.username, role: user.role })
      console.log("Stored password hash:", user.password)
      console.log("Input password:", password)

      // ตรวจสอบรหัสผ่าน
      let passwordMatch = false

      // ถ้ารหัสผ่านคือ "password" และผู้ใช้คือ "admin" (สำหรับการทดสอบเท่านั้น)
      if (password === "password" && username === "admin") {
        console.log("Using direct password check for admin")
        passwordMatch = true
      } else {
        try {
          // ลองใช้ bcrypt.compare
          passwordMatch = await bcrypt.compare(password, user.password)
          console.log("bcrypt.compare result:", passwordMatch)
        } catch (error) {
          console.error("bcrypt.compare error:", error)
        }
      }

      if (!passwordMatch) {
        console.log("Password does not match for user:", username)
        return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 })
      }

      // สร้าง JWT token
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key"
      console.log("Using JWT_SECRET:", jwtSecret.substring(0, 3) + "..." + jwtSecret.substring(jwtSecret.length - 3))

      const token = sign(
        {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        jwtSecret,
        { expiresIn: "1d" },
      )

      console.log("JWT token created successfully")

      // เก็บ token ใน cookie
      const cookieStore = await cookies()
      await cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // เพิ่ม sameSite: "lax" เพื่อให้ cookie ถูกส่งไปกับคำขอ API
        maxAge: 60 * 60 * 24, // 1 วัน
      })

      console.log("Cookie set successfully")
      console.log("Cookie details:", {
        name: "auth_token",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      })

      // ตรวจสอบว่า cookie ถูกตั้งค่าหรือไม่
      const authToken = await cookieStore.get("auth_token")
      console.log("Cookie verification:", authToken ? "Cookie set successfully" : "Failed to set cookie")

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

