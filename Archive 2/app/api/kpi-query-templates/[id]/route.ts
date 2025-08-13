import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// GET: ดึง Query Template ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const conn = await createConnection()
    
    try {
      const [rows] = await conn.execute(
        `SELECT 
          qt.*,
          k.title as kpi_title,
          u.name as created_by_name
        FROM kpi_query_templates qt
        JOIN kpis k ON qt.kpi_id = k.id
        JOIN users u ON qt.created_by = u.id
        WHERE qt.id = ?`,
        [id]
      )
      
      if ((rows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบ template" }, { status: 404 })
      }
      
      return NextResponse.json({ template: (rows as any[])[0] })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get query template error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}

// PUT: อัปเดต Query Template
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

    // เฉพาะ admin และ manager เท่านั้นที่สามารถแก้ไข template ได้
    if (!['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการแก้ไข template" }, { status: 403 })
    }

    const body = await request.json()
    const {
      kpi_id,
      name,
      description,
      query_type,
      query_template,
      parameters
    } = body

    // Validation
    if (!kpi_id || !name || !query_type || !query_template) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    const conn = await createConnection()
    
    try {
      // ตรวจสอบว่า template มีอยู่จริง
      const [existingRows] = await conn.execute(
        "SELECT * FROM kpi_query_templates WHERE id = ?",
        [id]
      )
      
      if ((existingRows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบ template" }, { status: 404 })
      }

      // อัปเดต Query Template
      await conn.execute(
        `UPDATE kpi_query_templates SET
          kpi_id = ?, name = ?, description = ?, query_type = ?, 
          query_template = ?, parameters = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          kpi_id, name, description, query_type, query_template, 
          JSON.stringify(parameters), id
        ]
      )

      // ดึงข้อมูลที่อัปเดตแล้ว
      const [updatedRows] = await conn.execute(
        "SELECT * FROM kpi_query_templates WHERE id = ?",
        [id]
      )

      return NextResponse.json({ 
        success: true, 
        template: (updatedRows as any[])[0] 
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Update query template error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดต template" }, { status: 500 })
  }
}

// DELETE: ลบ Query Template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // เฉพาะ admin และ manager เท่านั้นที่สามารถลบ template ได้
    if (!['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการลบ template" }, { status: 403 })
    }

    const conn = await createConnection()
    
    try {
      // ตรวจสอบว่า template มีอยู่จริง
      const [existingRows] = await conn.execute(
        "SELECT * FROM kpi_query_templates WHERE id = ?",
        [id]
      )
      
      if ((existingRows as any[]).length === 0) {
        return NextResponse.json({ error: "ไม่พบ template" }, { status: 404 })
      }

      // ลบ Query Template
      await conn.execute(
        "DELETE FROM kpi_query_templates WHERE id = ?",
        [id]
      )

      return NextResponse.json({ success: true })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Delete query template error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบ template" }, { status: 500 })
  }
}
