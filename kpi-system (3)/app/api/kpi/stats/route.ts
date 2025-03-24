import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const conn = await createConnection()

    try {
      let totalQuery = "SELECT COUNT(*) as total FROM kpis"
      let pendingQuery = "SELECT COUNT(*) as pending FROM kpis WHERE status = 'pending'"
      let approvedQuery = "SELECT COUNT(*) as approved FROM kpis WHERE status = 'approved'"
      let departmentsQuery = "SELECT COUNT(DISTINCT dept) as departments FROM kpis"

      const params: any[] = []

      // จำกัดผลลัพธ์ตาม role
      if (session.user.role === "user") {
        totalQuery += " WHERE onwer1 = ? OR onwer2 = ?"
        pendingQuery += " AND (onwer1 = ? OR onwer2 = ?)"
        approvedQuery += " AND (onwer1 = ? OR onwer2 = ?)"
        departmentsQuery += " WHERE onwer1 = ? OR onwer2 = ?"

        params.push(session.user.id, session.user.id)
      }

      const [totalRows] = await conn.execute(totalQuery, params.length ? [params[0], params[1]] : [])
      const [pendingRows] = await conn.execute(pendingQuery, params.length ? [params[0], params[1]] : [])
      const [approvedRows] = await conn.execute(approvedQuery, params.length ? [params[0], params[1]] : [])
      const [departmentsRows] = await conn.execute(departmentsQuery, params.length ? [params[0], params[1]] : [])

      return NextResponse.json({
        total: (totalRows as any[])[0].total,
        pending: (pendingRows as any[])[0].pending,
        approved: (approvedRows as any[])[0].approved,
        departments: (departmentsRows as any[])[0].departments,
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get KPI stats error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงสถิติ KPI" }, { status: 500 })
  }
}

