import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

export async function GET() {
  try {
    const session = await getServerSession()
    console.log("DEBUG: Connection test - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการดูข้อมูล" }, { status: 403 })
    }

    console.log("DEBUG: Creating database connection...")

    try {
      const conn = await createConnection()
      console.log("DEBUG: Database connection successful")

      try {
        // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
        const [connectionTest] = await conn.execute("SELECT 1 as test")
        console.log("DEBUG: Connection test result:", (connectionTest as any[])[0])

        // ตรวจสอบการเข้าถึงตาราง users
        const [userCount] = await conn.execute("SELECT COUNT(*) as count FROM users")
        console.log("DEBUG: User count:", (userCount as any[])[0])

        // ตรวจสอบข้อมูลผู้ใช้ ID 2
        const [user] = await conn.execute("SELECT id, username, name, email, role FROM users WHERE id = 2")
        console.log("DEBUG: User ID 2:", (user as any[]).length > 0 ? (user as any[])[0] : "Not found")

        return NextResponse.json({
          success: true,
          connectionTest: (connectionTest as any[])[0],
          userCount: (userCount as any[])[0],
          user: (user as any[]).length > 0 ? (user as any[])[0] : null,
          dbConfig: {
            host: process.env.DB_HOST || "not set",
            user: process.env.DB_USER || "not set",
            database: process.env.DB_NAME || "not set",
            port: process.env.DB_PORT || "not set",
          },
        })
      } finally {
        console.log("DEBUG: Closing database connection")
        await conn.end()
      }
    } catch (dbError) {
      console.error("DEBUG: Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล",
          details: dbError,
          dbConfig: {
            host: process.env.DB_HOST || "not set",
            user: process.env.DB_USER || "not set",
            database: process.env.DB_NAME || "not set",
            port: process.env.DB_PORT || "not set",
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("DEBUG: Error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบการเชื่อมต่อ", details: error }, { status: 500 })
  }
}

