import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// อนุมัติ KPI
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การอนุมัติ KPI
    if (session.user.role !== "admin" && session.user.role !== "approver") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ KPI" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      // ตรวจสอบว่า KPI มีอยู่จริง
      const [rows] = await conn.execute("SELECT id, status FROM kpis WHERE id = ?", [id])

      const kpis = rows as any[]

      if (kpis.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล KPI" }, { status: 404 })
      }

      const kpi = kpis[0]

      // ตรวจสอบว่า KPI ยังไม่ได้อนุมัติ
      if (kpi.status === "approved") {
        return NextResponse.json({ error: "KPI นี้ได้รับการอนุมัติแล้ว" }, { status: 400 })
      }

      // อัปเดตสถานะเป็นอนุมัติแล้ว
      await conn.execute("UPDATE kpis SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?", [
        session.user.id,
        id,
      ])

      return NextResponse.json({
        success: true,
        message: "อนุมัติ KPI สำเร็จ",
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Approve KPI error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอนุมัติ KPI" }, { status: 500 })
  }
}

