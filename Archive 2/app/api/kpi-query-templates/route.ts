import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// GET: ดึงรายการ Query Templates
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const conn = await createConnection()
    
    try {
      const [rows] = await conn.execute(`
        SELECT 
          qt.*,
          k.title as kpi_title,
          u.name as created_by_name
        FROM kpi_query_templates qt
        JOIN kpis k ON qt.kpi_id = k.id
        JOIN users u ON qt.created_by = u.id
        ORDER BY qt.created_at DESC
      `)
      
      return NextResponse.json({ templates: rows })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get query templates error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}

// POST: สร้าง Query Template ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // เฉพาะ admin และ manager เท่านั้นที่สามารถสร้าง template ได้
    if (!['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการสร้าง template" }, { status: 403 })
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
      // สร้าง Query Template
      const [result] = await conn.execute(
        `INSERT INTO kpi_query_templates (
          kpi_id, name, description, query_type, query_template, parameters, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          kpi_id, name, description, query_type, query_template, 
          JSON.stringify(parameters), session.user.id
        ]
      )

      const insertId = (result as any).insertId

      // ดึงข้อมูลที่สร้างใหม่
      const [newRows] = await conn.execute(
        "SELECT * FROM kpi_query_templates WHERE id = ?",
        [insertId]
      )

      return NextResponse.json({ 
        success: true, 
        template: (newRows as any[])[0] 
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Create query template error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้าง template" }, { status: 500 })
  }
}
