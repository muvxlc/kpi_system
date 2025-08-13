import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// ดึงข้อมูลประเภท KPI ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT * FROM kpi_types ORDER BY id")
      return NextResponse.json(rows)
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get KPI types error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภท KPI" }, { status: 500 })
  }
}

// เพิ่มประเภท KPI ใหม่ (สำหรับ admin เท่านั้น)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เพิ่มประเภท KPI" }, { status: 403 })
    }

    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อประเภท KPI" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      const [result] = await conn.execute("INSERT INTO kpi_types (name, description) VALUES (?, ?)", [
        data.name,
        data.description || "",
      ])

      return NextResponse.json({
        success: true,
        message: "เพิ่มประเภท KPI สำเร็จ",
        id: (result as any).insertId,
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Create KPI type error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการเพิ่มประเภท KPI" }, { status: 500 })
  }
}

