import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// PUT: เปลี่ยนสถานะ KPI Result
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const body = await request.json()
    const { status, note } = body

    // ตรวจสอบสถานะที่อนุญาต
    const allowedStatuses = ['draft', 'submitted', 'approved', 'rejected']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 })
    }

    const conn = await createConnection()
    
    try {
      // ตรวจสอบว่า KPI Result นี้มีอยู่จริงหรือไม่
      const [existingRows] = await conn.execute(
        "SELECT id, created_by, status FROM kpi_results WHERE id = ?",
        [params.id]
      )

      if ((existingRows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
      }

      const existingResult = (existingRows as any[])[0]

      // ตรวจสอบสิทธิ์ในการเปลี่ยนสถานะ
      let canChangeStatus = false
      
      if (status === 'draft' || status === 'submitted') {
        // ผู้สร้างสามารถเปลี่ยนเป็นร่างหรือส่งได้
        canChangeStatus = session.user.role === 'admin' || existingResult.created_by === session.user.id
      } else if (status === 'approved' || status === 'rejected') {
        // เฉพาะ admin, approver, และ manager เท่านั้นที่สามารถอนุมัติหรือไม่อนุมัติได้
        canChangeStatus = session.user.role === 'admin' || session.user.role === 'approver' || session.user.role === 'manager'
      }

      if (!canChangeStatus) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ในการเปลี่ยนสถานะ" }, { status: 403 })
      }

      // อัปเดตสถานะ
      const updateData: any[] = [status]
      let updateQuery = "UPDATE kpi_results SET status = ?"

      if (status === 'approved' || status === 'rejected') {
        updateQuery += ", approved_by = ?, approved_at = CURRENT_TIMESTAMP"
        updateData.push(session.user.id)
      }

      if (note) {
        updateQuery += ", note = ?"
        updateData.push(note)
      }

      updateQuery += ", updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      updateData.push(params.id)

      await conn.execute(updateQuery, updateData)

      // ดึงข้อมูลที่อัปเดตแล้ว
      const [updatedRows] = await conn.execute(
        "SELECT * FROM kpi_results WHERE id = ?",
        [params.id]
      )

      return NextResponse.json({ 
        success: true, 
        result: (updatedRows as any[])[0] 
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Update KPI result status error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }, { status: 500 })
  }
}
