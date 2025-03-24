import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth"

// ดึงข้อมูล KPI ตาม ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      const [rows] = await conn.execute(
        `SELECT k.*, u1.name as owner1_name, u2.name as owner2_name, d.name as dept_name
         FROM kpis k
         LEFT JOIN users u1 ON k.onwer1 = u1.id
         LEFT JOIN users u2 ON k.onwer2 = u2.id
         LEFT JOIN departments d ON k.dept = d.id
         WHERE k.id = ?`,
        [id],
      )

      const kpis = rows as any[]

      if (kpis.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล KPI" }, { status: 404 })
      }

      // ตรวจสอบสิทธิ์การเข้าถึง KPI
      const kpi = kpis[0]

      if (
        session.user.role !== "admin" &&
        session.user.role !== "approver" &&
        session.user.id !== kpi.onwer1 &&
        session.user.id !== kpi.onwer2
      ) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูล KPI นี้" }, { status: 403 })
      }

      return NextResponse.json(kpi)
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Get KPI error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล KPI" }, { status: 500 })
  }
}

// อัปเดตข้อมูล KPI
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const data = await request.json()

    const conn = await createConnection()

    try {
      // ตรวจสอบว่า KPI มีอยู่จริงและผู้ใช้มีสิทธิ์แก้ไข
      const [rows] = await conn.execute("SELECT id, onwer1, onwer2, status FROM kpis WHERE id = ?", [id])

      const kpis = rows as any[]

      if (kpis.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล KPI" }, { status: 404 })
      }

      const kpi = kpis[0]

      // ตรวจสอบสิทธิ์การแก้ไข KPI
      if (session.user.role !== "admin" && session.user.id !== kpi.onwer1 && session.user.id !== kpi.onwer2) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขข้อมูล KPI นี้" }, { status: 403 })
      }

      // ไม่อนุญาตให้แก้ไข KPI ที่อนุมัติแล้ว ยกเว้น admin
      if (kpi.status === "approved" && session.user.role !== "admin") {
        return NextResponse.json({ error: "ไม่สามารถแก้ไข KPI ที่อนุมัติแล้ว" }, { status: 403 })
      }

      // อัปเดตข้อมูล KPI
      await conn.execute(
        `UPDATE kpis SET
          \`group\` = ?, plan = ?, project = ?, title = ?, titleEn = ?, 
          detail = ?, objective = ?, xfunction = ?, var_a = ?, var_b = ?, 
          icd_code = ?, round = ?, measure = ?, goal = ?, alert = ?, 
          benchmark = ?, method = ?, ref = ?, date_start = ?, dept = ?, 
          onwer1 = ?, onwer2 = ?, note = ?, image = ?, updated_at = NOW()
         WHERE id = ?`,
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
          data.onwer1,
          data.onwer2 || "",
          data.note || "",
          data.image || "",
          id,
        ],
      )

      return NextResponse.json({
        success: true,
        message: "อัปเดตข้อมูล KPI สำเร็จ",
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Update KPI error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล KPI" }, { status: 500 })
  }
}

// ลบข้อมูล KPI
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ตรวจสอบว่าเป็น admin เท่านั้นที่สามารถลบได้
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ลบข้อมูล KPI" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      // ตรวจสอบว่า KPI มีอยู่จริง
      const [rows] = await conn.execute("SELECT id FROM kpis WHERE id = ?", [id])

      const kpis = rows as any[]

      if (kpis.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล KPI" }, { status: 404 })
      }

      // ลบข้อมูล KPI
      await conn.execute("DELETE FROM kpis WHERE id = ?", [id])

      return NextResponse.json({
        success: true,
        message: "ลบข้อมูล KPI สำเร็จ",
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Delete KPI error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล KPI" }, { status: 500 })
  }
}

