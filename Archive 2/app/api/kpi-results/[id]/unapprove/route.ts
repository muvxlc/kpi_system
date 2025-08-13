import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// PUT: ยกเลิกอนุมัติ KPI Result
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // เฉพาะ admin เท่านั้นที่สามารถยกเลิกอนุมัติได้
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการยกเลิกอนุมัติ" }, { status: 403 })
    }

    const conn = await createConnection()

    try {
      // ตรวจสอบว่า KPI result มีอยู่จริงและเป็นสถานะ approved
      const [existingRows] = await conn.execute(
        "SELECT id, status FROM kpi_results WHERE id = ?",
        [id]
      )

      if ((existingRows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบ KPI result" }, { status: 404 })
      }

      const existingResult = (existingRows as any[])[0]
      
      if (existingResult.status !== 'approved') {
        return NextResponse.json({ error: "สามารถยกเลิกอนุมัติได้เฉพาะรายการที่อนุมัติแล้วเท่านั้น" }, { status: 400 })
      }

      // อัปเดตสถานะเป็น draft และล้างข้อมูลการอนุมัติ
      await conn.execute(
        `UPDATE kpi_results SET 
          status = 'draft',
          approved_by = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [id]
      )

      // ดึงข้อมูลที่อัปเดตแล้ว
      const [updatedRows] = await conn.execute(
        "SELECT * FROM kpi_results WHERE id = ?",
        [id]
      )

      return NextResponse.json({
        success: true,
        message: "ยกเลิกอนุมัติสำเร็จ",
        result: (updatedRows as any[])[0]
      })

    } finally {
      await conn.end()
    }

  } catch (error) {
    console.error("Unapprove KPI result error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการยกเลิกอนุมัติ" }, { status: 500 })
  }
}
