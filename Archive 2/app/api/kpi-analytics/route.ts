import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// GET: ดึงข้อมูล Analytics สำหรับ Dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fiscalYear = searchParams.get("fiscalYear")
    const period = searchParams.get("period")
    const kpiId = searchParams.get("kpiId")

    const conn = await createConnection()

    try {
      // สร้าง WHERE clause ตาม parameters
      let whereClause = "WHERE 1=1"
      const params: any[] = []

      if (fiscalYear) {
        whereClause += " AND kr.fiscal_year = ?"
        params.push(parseInt(fiscalYear))
      }

      if (period && period !== "all") {
        whereClause += " AND kr.period = ?"
        params.push(period)
      }

      if (kpiId && kpiId !== "all") {
        whereClause += " AND kr.kpi_id = ?"
        params.push(parseInt(kpiId))
      }

      // ดึงข้อมูล KPI และผลลัพธ์
      const [rows] = await conn.execute(`
        SELECT 
          kr.id as result_id,
          kr.kpi_id,
          k.title as kpi_title,
          kr.actual_value,
          kr.target_value as result_target_value,
          kr.achievement_percentage,
          kr.period,
          kr.fiscal_year,
          kr.created_at,
          kr.status
        FROM kpi_results kr
        LEFT JOIN kpis k ON kr.kpi_id = k.id
        ${whereClause}
        ORDER BY kr.kpi_id, kr.fiscal_year DESC, kr.period ASC
      `, params)

      // จัดกลุ่มข้อมูลตาม KPI
      const kpiMap = new Map()
      const results = rows as any[]

      results.forEach(row => {
        if (!kpiMap.has(row.kpi_id)) {
          kpiMap.set(row.kpi_id, {
            kpi_id: row.kpi_id,
            kpi_title: row.kpi_title,
            target_value: parseFloat(row.result_target_value) || 0,
            actual_values: [],
            achievement_percentage: 0,
            trend: 'stable',
            status: 'off_track'
          })
        }

        const kpi = kpiMap.get(row.kpi_id)
        
        if (row.actual_value !== null) {
          kpi.actual_values.push({
            period: row.period,
            value: parseFloat(row.actual_value),
            target_value: parseFloat(row.result_target_value) || kpi.target_value,
            achievement_percentage: parseFloat(row.achievement_percentage) || 0,
            date: row.created_at
          })
        }
      })

      // คำนวณ analytics สำหรับแต่ละ KPI
      const analytics = Array.from(kpiMap.values()).map(kpi => {
        if (kpi.actual_values.length === 0) {
          return {
            ...kpi,
            achievement_percentage: 0,
            trend: 'stable',
            status: 'off_track'
          }
        }

        // คำนวณ % ความสำเร็จเฉลี่ย
        const totalAchievement = kpi.actual_values.reduce((sum: number, value: any) => {
          // ใช้เป้าหมายจาก kpi_results เพื่อให้ตรงกับหน้าบันทึกผลลัพธ์
          const targetValue = value.target_value || kpi.target_value
          
          // ใช้ % ความสำเร็จที่มีอยู่แล้วในฐานข้อมูล
          return sum + (value.achievement_percentage || 0)
        }, 0)
        
        // ไม่ปัดเศษ เพื่อให้แสดงทศนิยมที่แท้จริง
        kpi.achievement_percentage = totalAchievement / kpi.actual_values.length

        // กำหนดสถานะตามเกณฑ์ใหม่
        if (kpi.achievement_percentage >= 100) {
          kpi.status = 'on_track'        // ตามเป้าหมาย: ≥100%
        } else if (kpi.achievement_percentage >= 60) {
          kpi.status = 'at_risk'         // มีความเสี่ยง: 60-99%
        } else {
          kpi.status = 'off_track'       // ไม่ตามเป้าหมาย: <60%
        }

        // กำหนดแนวโน้ม
        if (kpi.actual_values.length >= 2) {
          const sortedValues = kpi.actual_values.sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          
          const firstValue = sortedValues[0].value
          const lastValue = sortedValues[sortedValues.length - 1].value
          
          if (lastValue > firstValue * 1.1) {
            kpi.trend = 'increasing'
          } else if (lastValue < firstValue * 0.9) {
            kpi.trend = 'decreasing'
          } else {
            kpi.trend = 'stable'
          }
        }

        return kpi
      })

      // คำนวณสถิติรวม
      const stats = {
        total_kpis: analytics.length,
        on_track: analytics.filter(k => k.status === 'on_track').length,
        at_risk: analytics.filter(k => k.status === 'at_risk').length,
        off_track: analytics.filter(k => k.status === 'off_track').length,
        average_achievement: analytics.length > 0 
          ? analytics.reduce((sum, k) => sum + k.achievement_percentage, 0) / analytics.length
          : 0,
        total_results: analytics.reduce((sum, k) => sum + k.actual_values.length, 0)
      }

      return NextResponse.json({
        success: true,
        analytics,
        stats
      })

    } finally {
      await conn.end()
    }

  } catch (error) {
    console.error("KPI Analytics error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล analytics" }, { status: 500 })
  }
}
