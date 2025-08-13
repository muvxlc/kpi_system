import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"

// ดึงข้อมูล KPI ตาม ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    const id = Number.parseInt(paramsData.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      // เพิ่ม console.log เพื่อตรวจสอบการดึงข้อมูล
      console.log(`Fetching KPI details for ID: ${id}`)

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

      // เพิ่ม console.log เพื่อตรวจสอบผลลัพธ์
      console.log(`KPI found: ${kpis.length > 0 ? "Yes" : "No"}`)

      if (kpis.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล KPI" }, { status: 404 })
      }

      // ตรวจสอบสิทธิ์การเข้าถึง KPI
      const kpi = kpis[0]

      // แก้ไขตรงนี้: เพิ่ม role manager ให้สามารถเข้าถึงข้อมูล KPI ได้
      if (
        session.user.role !== "admin" &&
        session.user.role !== "approver" &&
        session.user.role !== "manager" && // เพิ่ม manager ให้มีสิทธิ์เข้าถึง
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
    console.log("PUT /api/kpi/[id] - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    const id = Number.parseInt(paramsData.id)
    console.log("PUT /api/kpi/[id] - KPI ID:", id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 })
    }

    const data = await request.json()
    console.log("PUT /api/kpi/[id] - Request data received:", { title: data.title, group: data.group })

    const conn = await createConnection()
    console.log("PUT /api/kpi/[id] - Database connection established")

    try {
      // ตรวจสอบว่า KPI มีอยู่จริงและผู้ใช้มีสิทธิ์แก้ไข
      const [rows] = await conn.execute("SELECT id, onwer1, onwer2, status FROM kpis WHERE id = ?", [id])
      console.log("PUT /api/kpi/[id] - KPI exists check:", (rows as any[]).length > 0 ? "Found" : "Not found")

      const kpis = rows as any[]

      if (kpis.length === 0) {
        return NextResponse.json({ error: "ไม่พบข้อมูล KPI" }, { status: 404 })
      }

      const kpi = kpis[0]
      console.log("PUT /api/kpi/[id] - KPI details:", { id: kpi.id, owner1: kpi.onwer1, status: kpi.status })
      console.log("PUT /api/kpi/[id] - User details:", { id: session.user.id, role: session.user.role })

      // ตรวจสอบสิทธิ์การแก้ไข KPI
      if (
        session.user.role !== "admin" &&
        session.user.role !== "manager" &&
        session.user.id !== kpi.onwer1 &&
        session.user.id !== kpi.onwer2
      ) {
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
          data.date_start
            ? new Date(data.date_start).toISOString().slice(0, 19).replace("T", " ")
            : new Date().toISOString().slice(0, 19).replace("T", " "),
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
    console.log("API: DELETE /api/kpi/[id] - Session:", session ? `User: ${session.user.username}` : "No session")

    if (!session) {
      return NextResponse.json(
        { error: "ไม่ได้รับอนุญาต" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      )
    }

    // ตรวจสอบว่าเป็น admin เท่านั้นที่สามารถลบได้
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์ลบข้อมูล KPI" },
        {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      )
    }

    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    const id = Number.parseInt(paramsData.id)
    console.log("API: DELETE /api/kpi/[id] - KPI ID:", id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID ไม่ถูกต้อง" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      )
    }

    console.log("API: DELETE /api/kpi/[id] - Creating database connection")
    const conn = await createConnection()
    console.log("API: DELETE /api/kpi/[id] - Database connection established")

    try {
      // ตรวจสอบว่า KPI มีอยู่จริง
      console.log("API: DELETE /api/kpi/[id] - Checking if KPI exists")
      const [rows] = await conn.execute("SELECT id FROM kpis WHERE id = ?", [id])

      const kpis = rows as any[]
      console.log("API: DELETE /api/kpi/[id] - KPI exists:", kpis.length > 0)

      if (kpis.length === 0) {
        return NextResponse.json(
          { error: "ไม่พบข้อมูล KPI" },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          },
        )
      }

      // ลบข้อมูล KPI
      console.log("API: DELETE /api/kpi/[id] - Deleting KPI")
      await conn.execute("DELETE FROM kpis WHERE id = ?", [id])
      console.log("API: DELETE /api/kpi/[id] - KPI deleted successfully")

      return NextResponse.json(
        {
          success: true,
          message: "ลบข้อมูล KPI สำเร็จ",
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      )
    } finally {
      console.log("API: DELETE /api/kpi/[id] - Closing database connection")
      await conn.end()
    }
  } catch (error) {
    console.error("API: DELETE /api/kpi/[id] - Error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบข้อมูล KPI" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

// เพิ่ม OPTIONS method เพื่อรองรับ CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

