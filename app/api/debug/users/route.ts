import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการดูข้อมูล" }, { status: 403 })
    }

    console.log("DEBUG: Creating database connection...")
    const conn = await createConnection()
    console.log("DEBUG: Database connection successful")

    try {
      // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
      const [connectionTest] = await conn.execute("SELECT 1 as test")
      console.log("DEBUG: Connection test:", (connectionTest as any[])[0])

      // ดึงข้อมูลผู้ใช้ทั้งหมด
      const [users] = await conn.execute("SELECT id, username, name, role FROM users")
      console.log("DEBUG: Found users:", (users as any[]).length)

      // ตรวจสอบโครงสร้างตาราง users
      const [tableInfo] = await conn.execute("DESCRIBE users")

      return NextResponse.json({
        connectionTest: (connectionTest as any[])[0],
        users: users,
        tableInfo: tableInfo,
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
  } catch (error) {
    console.error("DEBUG: Error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล", details: error }, { status: 500 })
  }
}

