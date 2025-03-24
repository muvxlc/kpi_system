import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// สร้าง KPI ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    console.log("POST /api/kpi - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบสิทธิ์การสร้าง KPI
    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ในการสร้าง KPI" }, { status: 403 })
    }

    const data = await request.json()

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.title || !data.group || !data.dept) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็น" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      // เพิ่มข้อมูล KPI ใหม่
      const [result] = await conn.execute(
        `INSERT INTO kpis (
          \`group\`, plan, project, title, titleEn, detail, objective, 
          xfunction, var_a, var_b, icd_code, round, measure, goal, 
          alert, benchmark, method, ref, date_start, dept, 
          onwer1, onwer2, note, image, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.group,
          data.plan || "",
          data.project || "",
          data.title,
          data.titleEn || "",
          data.detail || "",
          data.objective || "",
          data.xfunction || "",
          data.var_a || "",
          data.var_b || "",
          data.icd_code || "",
          data.round || "",
          data.measure || "",
          data.goal || "",
          data.alert || "",
          data.benchmark || "",
          data.method || "",
          data.ref || "",
          data.date_start || new Date(),
          data.dept,
          data.onwer1 || session.user.id,
          data.onwer2 || "",
          data.note || "",
          data.image || "",
          "pending",
          session.user.id,
        ],
      )

      const insertResult = result as any

      if (data.objective && data.objective.length > 65535) {
        return NextResponse.json({ error: "Objective too long" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        id: insertResult.insertId,
        message: "สร้าง KPI สำเร็จ",
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Create KPI error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้าง KPI" }, { status: 500 })
  }
}

// ดึงรายการ KPI
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    console.log("GET /api/kpi - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const group = searchParams.get("group")
    const dept = searchParams.get("dept")

    console.log("GET /api/kpi - Params:", { page, limit, group, dept })

    const offset = (page - 1) * limit

    const conn = await createConnection()

    try {
      // แก้ไขวิธีการดึงข้อมูล KPI โดยใช้วิธีที่ตรงไปตรงมามากขึ้น
      let whereClause = "WHERE 1=1"
      let countWhereClause = "WHERE 1=1"

      if (group && group !== "all") {
        whereClause += ` AND k.\`group\` = '${group}'`
        countWhereClause += ` AND \`group\` = '${group}'`
      }

      if (dept && dept !== "all") {
        whereClause += ` AND k.dept = '${dept}'`
        countWhereClause += ` AND dept = '${dept}'`
      }

      if (session.user.role === "user") {
        whereClause += ` AND (k.onwer1 = ${session.user.id} OR k.onwer2 = ${session.user.id})`
        countWhereClause += ` AND (onwer1 = ${session.user.id} OR onwer2 = ${session.user.id})`
      }

      // ใช้ query แบบไม่มี placeholders
      const query = `
        SELECT k.*, u1.name as owner1_name, u2.name as owner2_name, d.name as dept_name
        FROM kpis k
        LEFT JOIN users u1 ON k.onwer1 = u1.id
        LEFT JOIN users u2 ON k.onwer2 = u2.id
        LEFT JOIN departments d ON k.dept = d.id
        ${whereClause}
        ORDER BY k.title ASC LIMIT ${limit} OFFSET ${offset}
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM kpis
        ${countWhereClause}
      `

      console.log("GET /api/kpi - Query:", query)

      // ดึงข้อมูล KPI
      const [rows] = await conn.query(query)

      // ดึงจำนวน KPI ทั้งหมด
      const [countRows] = await conn.query(countQuery)
      const total = (countRows as any[])[0].total

      // ดึงรายการกลุ่ม KPI
      const [groupRows] = await conn.query("SELECT DISTINCT `group` FROM kpis")

      // ดึงรายการแผนก
      const [deptRows] = await conn.query("SELECT id, name FROM departments")

      return NextResponse.json({
        kpis: rows,
        total,
        groups: groupRows,
        departments: deptRows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get KPI list error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงรายการ KPI" }, { status: 500 })
  }
}

