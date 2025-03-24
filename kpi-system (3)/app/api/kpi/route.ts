import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// สร้าง KPI ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

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

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const group = searchParams.get("group")
    const dept = searchParams.get("dept")

    const offset = (page - 1) * limit

    const conn = await createConnection()

    try {
      // สร้าง query พื้นฐาน
      let query = `
        SELECT k.*, u1.name as owner1_name, u2.name as owner2_name, d.name as dept_name
        FROM kpis k
        LEFT JOIN users u1 ON k.onwer1 = u1.id
        LEFT JOIN users u2 ON k.onwer2 = u2.id
        LEFT JOIN departments d ON k.dept = d.id
        WHERE 1=1
      `

      let countQuery = `
        SELECT COUNT(*) as total
        FROM kpis
        WHERE 1=1
      `

      const queryParams: any[] = []
      const countParams: any[] = []

      // เพิ่มเงื่อนไขการค้นหา
      if (group) {
        query += " AND k.group = ?"
        countQuery += " AND `group` = ?"
        queryParams.push(group)
        countParams.push(group)
      }

      if (dept) {
        query += " AND k.dept = ?"
        countQuery += " AND dept = ?"
        queryParams.push(dept)
        countParams.push(dept)
      }

      // จำกัดผลลัพธ์ตาม role
      if (session.user.role === "user") {
        query += " AND (k.onwer1 = ? OR k.onwer2 = ?)"
        countQuery += " AND (onwer1 = ? OR onwer2 = ?)"
        queryParams.push(session.user.id, session.user.id)
        countParams.push(session.user.id, session.user.id)
      }

      // เพิ่ม ORDER BY และ LIMIT
      query += " ORDER BY k.id DESC LIMIT ? OFFSET ?"
      queryParams.push(limit, offset)

      // ดึงข้อมูล KPI
      const [rows] = await conn.execute(query, queryParams)

      // ดึงจำนวน KPI ทั้งหมด
      const [countRows] = await conn.execute(countQuery, countParams)
      const total = (countRows as any[])[0].total

      // ดึงรายการกลุ่ม KPI
      const [groupRows] = await conn.execute("SELECT DISTINCT `group` FROM kpis")

      // ดึงรายการแผนก
      const [deptRows] = await conn.execute("SELECT id, name FROM departments")

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

