import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// ดึงข้อมูลผู้ใช้ตาม ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    console.log("API: GET /api/users/[id] - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การดูข้อมูลผู้ใช้ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการดูข้อมูลผู้ใช้" }, { status: 403 })
    }

    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    const id = Number.parseInt(paramsData.id, 10)
    console.log("API: GET /api/users/[id] - Fetching user with ID:", id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    try {
      console.log("API: Creating database connection...")
      const conn = await createConnection()
      console.log("API: Database connection successful")

      try {
        console.log("API: Executing query for user ID:", id)
        // ใช้ parameterized query เพื่อป้องกัน SQL injection
        const [rows] = await conn.execute(
          "SELECT id, username, name, email, role, created_at, updated_at FROM users WHERE id = ?",
          [id],
        )

        const users = rows as any[]
        console.log("API: Query result - Found users:", users.length)

        if (users.length === 0) {
          console.log("API: User not found with ID:", id)

          // ลองดึงรายการผู้ใช้ทั้งหมดเพื่อตรวจสอบ
          const [allUsers] = await conn.execute("SELECT id, username FROM users LIMIT 10")
          console.log(
            "API: Available users:",
            (allUsers as any[]).map((u) => `ID: ${u.id}, Username: ${u.username}`),
          )

          return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
        }

        console.log("API: User found:", users[0].username)
        return NextResponse.json(users[0])
      } finally {
        console.log("API: Closing database connection")
        await conn.end()
      }
    } catch (dbError) {
      console.error("API: Database connection error:", dbError)
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 })
  }
}

// อัปเดตข้อมูลผู้ใช้
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("API: PUT /api/users/[id] - Starting with params:", params)

    const session = await getServerSession()
    console.log("API: PUT /api/users/[id] - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การแก้ไขข้อมูลผู้ใช้ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้" }, { status: 403 })
    }

    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    const id = Number.parseInt(paramsData.id, 10)
    console.log("API: PUT /api/users/[id] - User ID:", id)

    if (isNaN(id)) {
      console.log("API: PUT /api/users/[id] - Invalid ID")
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const data = await request.json()
    console.log("API: PUT /api/users/[id] - Request data:", {
      name: data.name,
      email: data.email,
      role: data.role,
      hasPassword: !!data.password,
    })

    try {
      console.log("API: PUT /api/users/[id] - Creating database connection")
      const conn = await createConnection()
      console.log("API: PUT /api/users/[id] - Database connection successful")

      try {
        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        console.log("API: PUT /api/users/[id] - Checking if user exists")
        const [rows] = await conn.execute("SELECT id FROM users WHERE id = ?", [id])

        const users = rows as any[]
        console.log("API: PUT /api/users/[id] - User exists:", users.length > 0)

        if (users.length === 0) {
          return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
        }

        // สร้าง query สำหรับอัปเดตข้อมูล
        const updateFields = []
        const updateValues = []

        if (data.name) {
          updateFields.push("name = ?")
          updateValues.push(data.name)
        }

        if (data.email !== undefined) {
          updateFields.push("email = ?")
          updateValues.push(data.email)
        }

        if (data.role) {
          updateFields.push("role = ?")
          updateValues.push(data.role)
        }

        // ถ้ามีการส่งรหัสผ่านมา ให้เข้ารหัสก่อนบันทึก
        if (data.password) {
          console.log("API: PUT /api/users/[id] - Password provided, hashing")
          const bcrypt = require("bcryptjs")
          const hashedPassword = await bcrypt.hash(data.password, 10)
          updateFields.push("password = ?")
          updateValues.push(hashedPassword)
        }

        if (updateFields.length === 0) {
          console.log("API: PUT /api/users/[id] - No fields to update")
          return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องการอัปเดต" }, { status: 400 })
        }

        // อัปเดตข้อมูลผู้ใช้
        const query = `UPDATE users SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`
        console.log("API: PUT /api/users/[id] - Update query:", query)

        const result = await conn.execute(query, [...updateValues, id])
        console.log("API: PUT /api/users/[id] - Update result:", result)

        return NextResponse.json({
          success: true,
          message: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
        })
      } finally {
        console.log("API: PUT /api/users/[id] - Closing database connection")
        await conn.end()
      }
    } catch (dbError) {
      console.error("API: PUT /api/users/[id] - Database error:", dbError)
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล" }, { status: 500 })
    }
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้" }, { status: 500 })
  }
}

// ลบผู้ใช้
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("API: DELETE /api/users/[id] - Starting with params:", params)

    const session = await getServerSession()
    console.log("API: DELETE /api/users/[id] - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การลบผู้ใช้ (เฉพาะ admin)
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการลบผู้ใช้" }, { status: 403 })
    }

    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    const id = Number.parseInt(paramsData.id, 10)
    console.log("API: DELETE /api/users/[id] - User ID:", id)

    if (isNaN(id)) {
      console.log("API: DELETE /api/users/[id] - Invalid ID")
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    try {
      console.log("API: DELETE /api/users/[id] - Creating database connection")
      const conn = await createConnection()
      console.log("API: DELETE /api/users/[id] - Database connection successful")

      try {
        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        console.log("API: DELETE /api/users/[id] - Checking if user exists")
        const [rows] = await conn.execute("SELECT id, username FROM users WHERE id = ?", [id])

        const users = rows as any[]
        console.log("API: DELETE /api/users/[id] - User exists:", users.length > 0)

        if (users.length === 0) {
          return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
        }

        // ป้องกันการลบผู้ใช้ admin
        if (users[0].username === "admin") {
          console.log("API: DELETE /api/users/[id] - Cannot delete admin user")
          return NextResponse.json({ error: "ไม่สามารถลบผู้ใช้ admin ได้" }, { status: 403 })
        }

        // ลบผู้ใช้
        console.log("API: DELETE /api/users/[id] - Deleting user")
        await conn.execute("DELETE FROM users WHERE id = ?", [id])
        console.log("API: DELETE /api/users/[id] - User deleted successfully")

        return NextResponse.json({
          success: true,
          message: "ลบผู้ใช้สำเร็จ",
        })
      } finally {
        console.log("API: DELETE /api/users/[id] - Closing database connection")
        await conn.end()
      }
    } catch (dbError) {
      console.error("API: DELETE /api/users/[id] - Database error:", dbError)
      return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบผู้ใช้" }, { status: 500 })
  }
}

