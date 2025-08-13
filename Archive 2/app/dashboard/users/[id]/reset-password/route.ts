import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

// รีเซ็ตรหัสผ่านผู้ใช้
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("API: POST /api/users/[id]/reset-password - Starting with params:", { id: params.id })

    // ไม่ต้องใช้ await กับ params เนื่องจาก params ไม่ใช่ Promise
    const id = Number.parseInt(params.id, 10)
    console.log("API: POST /api/users/[id]/reset-password - User ID:", id)

    if (isNaN(id)) {
      console.log("API: POST /api/users/[id]/reset-password - Invalid ID")
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    // ตรวจสอบ cookies ที่ได้รับ
    const cookieStore = cookies()
    const allCookies = (await cookieStore).getAll()
    console.log(
      "API: POST /api/users/[id]/reset-password - Cookies received:",
      allCookies.map((c) => c.name),
    )

    // ดึง auth_token cookie โดยตรง
    const authToken = (await cookieStore).get("auth_token")
    console.log("API: POST /api/users/[id]/reset-password - Auth token:", authToken ? "Found" : "Not found")

    // ตรวจสอบ headers ที่ได้รับ
    const headers = Object.fromEntries(request.headers.entries())
    console.log(
      "API: POST /api/users/[id]/reset-password - Headers received:",
      Object.keys(headers).filter((key) => key.toLowerCase().includes("cookie")),
    )

    const session = await getServerSession()
    console.log(
      "API: POST /api/users/[id]/reset-password - Session:",
      session ? `User: ${session.user.username}` : "No session",
    )

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การรีเซ็ตรหัสผ่าน (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการรีเซ็ตรหัสผ่าน" }, { status: 403 })
    }

    try {
      console.log("API: POST /api/users/[id]/reset-password - Creating database connection")
      const conn = await createConnection()
      console.log("API: POST /api/users/[id]/reset-password - Database connection successful")

      try {
        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        console.log("API: POST /api/users/[id]/reset-password - Checking if user exists")
        const [rows] = await conn.execute("SELECT id, username FROM users WHERE id = ?", [id])

        const users = rows as any[]
        console.log("API: POST /api/users/[id]/reset-password - User exists:", users.length > 0)

        if (users.length === 0) {
          return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
        }

        // รีเซ็ตรหัสผ่านเป็น "password"
        console.log("API: POST /api/users/[id]/reset-password - Hashing new password")
        const hashedPassword = await bcrypt.hash("password", 10)
        console.log("API: POST /api/users/[id]/reset-password - Password hashed successfully")

        // อัปเดตรหัสผ่าน
        console.log("API: POST /api/users/[id]/reset-password - Updating password in database")
        const result = await conn.execute("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [
          hashedPassword,
          id,
        ])
        console.log("API: POST /api/users/[id]/reset-password - Update result:", result)

        return NextResponse.json({
          success: true,
          message: "รีเซ็ตรหัสผ่านสำเร็จ",
        })
      } finally {
        console.log("API: POST /api/users/[id]/reset-password - Closing database connection")
        await conn.end()
      }
    } catch (dbError) {
      console.error("API: POST /api/users/[id]/reset-password - Database error:", dbError)
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล", details: dbError }, { status: 500 })
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }, { status: 500 })
  }
}

