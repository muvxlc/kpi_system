import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// ดึงรายการผู้ใช้
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    console.log("GET /api/users - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การดูรายการผู้ใช้ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการดูรายการผู้ใช้" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    console.log("GET /api/users - Params:", { page, limit, search })

    const offset = (page - 1) * limit

    const conn = await createConnection()

    try {
      // สร้าง query แบบไม่มี placeholders
      let whereClause = "WHERE 1=1"
      let countWhereClause = "WHERE 1=1"

      if (search) {
        whereClause += ` AND (username LIKE '%${search}%' OR name LIKE '%${search}%')`
        countWhereClause += ` AND (username LIKE '%${search}%' OR name LIKE '%${search}%')`
      }

      const query = `
        SELECT id, username, name, email, role, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY id ASC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM users
        ${countWhereClause}
      `

      console.log("GET /api/users - Query:", query)

      // ดึงข้อมูลผู้ใช้
      const [rows] = await conn.query(query)

      // ดึงจำนวนผู้ใช้ทั้งหมด
      const [countRows] = await conn.query(countQuery)
      const total = (countRows as any[])[0].total

      return NextResponse.json({
        users: rows,
        total,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get users list error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงรายการผู้ใช้" }, { status: 500 })
  }
}

// สร้างผู้ใช้ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การสร้างผู้ใช้ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการสร้างผู้ใช้" }, { status: 403 })
    }

    const data = await request.json()

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.username || !data.password || !data.name || !data.role) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็น" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      // ตรวจสอบว่ามีชื่อผู้ใช้นี้อยู่แล้วหรือไม่
      const [existingUsers] = await conn.query(`SELECT id FROM users WHERE username = '${data.username}'`)

      if ((existingUsers as any[]).length > 0) {
        return NextResponse.json({ error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" }, { status: 400 })
      }

      // เข้ารหัสรหัสผ่าน
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // เพิ่มผู้ใช้ใหม่
      const [result] = await conn.query(
        `INSERT INTO users (username, password, name, email, role)
         VALUES ('${data.username}', '${hashedPassword}', '${data.name}', '${data.email || ""}', '${data.role}')`,
      )

      const insertResult = result as any

      return NextResponse.json({
        success: true,
        id: insertResult.insertId,
        message: "สร้างผู้ใช้สำเร็จ",
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" }, { status: 500 })
  }
}

