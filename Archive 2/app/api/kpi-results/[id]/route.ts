import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// GET: ดึงข้อมูล KPI Result ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const conn = await createConnection()
    
    try {
      const [rows] = await conn.execute(
        `SELECT 
          kr.*,
          k.title as kpi_title,
          k.goal,
          k.measure
        FROM kpi_results kr
        JOIN kpis k ON kr.kpi_id = k.id
        WHERE kr.id = ?`,
        [params.id]
      )

      if ((rows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
      }

      return NextResponse.json({ result: (rows as any[])[0] })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get KPI result error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}

// PUT: แก้ไข KPI Result
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
    const {
      actual_value,
      target_value,
      query_condition,
      note
    } = body

    const conn = await createConnection()
    
    try {
      // ตรวจสอบว่า KPI Result นี้มีอยู่จริงหรือไม่
      const [existingRows] = await conn.execute(
        "SELECT id, created_by FROM kpi_results WHERE id = ?",
        [params.id]
      )

      if ((existingRows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
      }

      const existingResult = (existingRows as any[])[0]

      // ตรวจสอบสิทธิ์ในการแก้ไข (เฉพาะผู้สร้างหรือ admin)
      if (session.user.role !== 'admin' && existingResult.created_by !== session.user.id) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ในการแก้ไข" }, { status: 403 })
      }

      // คำนวณร้อยละความสำเร็จ
      let achievement_percentage = null
      if (actual_value !== null && target_value !== null && target_value !== 0) {
        achievement_percentage = Math.round((actual_value / target_value) * 100 * 100) / 100
      }

      // อัปเดตข้อมูล
      await conn.execute(
        `UPDATE kpi_results SET 
          actual_value = ?,
          target_value = ?,
          achievement_percentage = ?,
          query_condition = ?,
          note = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          actual_value,
          target_value,
          achievement_percentage,
          query_condition,
          note,
          params.id
        ]
      )

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
    console.error("Update KPI result error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 })
  }
}

// DELETE: ลบ KPI Result
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
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

      // ตรวจสอบสิทธิ์ในการลบ (เฉพาะผู้สร้างหรือ admin)
      if (session.user.role !== 'admin' && existingResult.created_by !== session.user.id) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์ในการลบ" }, { status: 403 })
      }

      // ตรวจสอบสถานะ (ไม่อนุญาตให้ลบถ้าอนุมัติแล้ว)
      if (existingResult.status === 'approved') {
        return NextResponse.json({ error: "ไม่อนุญาตให้ลบข้อมูลที่อนุมัติแล้ว" }, { status: 400 })
      }

      // ลบข้อมูล
      await conn.execute(
        "DELETE FROM kpi_results WHERE id = ?",
        [params.id]
      )

      return NextResponse.json({ success: true })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Delete KPI result error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 })
  }
}
