import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// GET: ดึงรายการ KPI Results
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const kpiId = searchParams.get("kpiId")
    const fiscalYear = searchParams.get("fiscalYear")
    const period = searchParams.get("period")

    const conn = await createConnection()
    
    try {
      let query = `
        SELECT 
          kr.id,
          kr.kpi_id,
          kr.fiscal_year,
          kr.period,
          kr.period_start_date as period_start,
          kr.period_end_date as period_end,
          kr.actual_value,
          kr.target_value,
          kr.achievement_percentage,
          kr.result_type as data_source,
          kr.query_condition,
          kr.status,
          kr.created_by,
          kr.created_at,
          k.title as kpi_title,
          u1.name as created_by_name,
          u2.name as approved_by_name
        FROM kpi_results kr
        JOIN kpis k ON kr.kpi_id = k.id
        JOIN users u1 ON kr.created_by = u1.id
        LEFT JOIN users u2 ON kr.approved_by = u2.id
        WHERE 1=1
      `
      const params: any[] = []

      if (kpiId) {
        query += " AND kr.kpi_id = ?"
        params.push(kpiId)
      }
      
      if (fiscalYear) {
        query += " AND kr.fiscal_year = ?"
        params.push(fiscalYear)
      }
      
      if (period && period !== "all") {
        query += " AND kr.period = ?"
        params.push(period)
      }

      // จำกัดผลลัพธ์ตาม role
      if (session.user.role === "user") {
        query += " AND (k.onwer1 = ? OR k.onwer2 = ?)"
        params.push(session.user.id, session.user.id)
      }

      query += " ORDER BY kr.fiscal_year DESC, kr.period DESC, kr.created_at DESC"

      const [rows] = await conn.execute(query, params)
      
      return NextResponse.json({ results: rows })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get KPI results error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 })
  }
}

// POST: สร้าง KPI Result ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การบันทึกผลลัพธ์ (เฉพาะ admin, manager, staff)
    if (!['admin', 'manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการบันทึกผลลัพธ์ KPI" }, { status: 403 })
    }

    const body = await request.json()
    const {
      kpi_id,
      fiscal_year,
      period,
      period_start,
      period_end,
      actual_value,
      target_value,
      data_source,
      query_condition,
      note
    } = body

    // Validation
    if (!kpi_id || !fiscal_year || !period || !period_start || !period_end) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    const conn = await createConnection()
    
    try {
      // แปลง period เป็นรูปแบบที่ตารางรองรับ
      const periodMap: Record<string, string> = {
        '3': '3months',
        '6': '6months', 
        '9': '9months',
        '12': 'yearly'
      }
      const dbPeriod = periodMap[period] || period

      // ตรวจสอบว่า KPI นี้มีผลลัพธ์ในรอบเดียวกันแล้วหรือไม่
      const [existingRows] = await conn.execute(
        "SELECT id FROM kpi_results WHERE kpi_id = ? AND fiscal_year = ? AND period = ?",
        [kpi_id, fiscal_year, dbPeriod]
      )

      if ((existingRows as any[]).length > 0) {
        return NextResponse.json({ error: "มีผลลัพธ์ในรอบนี้แล้ว" }, { status: 400 })
      }

      // คำนวณร้อยละความสำเร็จ
      let achievement_percentage = null
      if (actual_value !== null && target_value !== null && target_value !== 0) {
        achievement_percentage = Math.round((actual_value / target_value) * 100 * 100) / 100
      }

      // สร้าง KPI Result
      const [result] = await conn.execute(
        `INSERT INTO kpi_results (
          kpi_id, fiscal_year, period, period_start_date, period_end_date,
          actual_value, target_value, achievement_percentage,
          result_type, query_condition, note, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kpi_id, fiscal_year, dbPeriod, period_start, period_end,
          actual_value, target_value, achievement_percentage,
          data_source, query_condition, note, session.user.id
        ]
      )

      const insertId = (result as any).insertId

      // ดึงข้อมูลที่สร้างใหม่
      const [newRows] = await conn.execute(
        "SELECT * FROM kpi_results WHERE id = ?",
        [insertId]
      )

      return NextResponse.json({ 
        success: true, 
        result: (newRows as any[])[0] 
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Create KPI result error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" }, { status: 500 })
  }
}
