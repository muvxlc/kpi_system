import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"
import { cookies } from "next/headers"

// อนุมัติ KPI
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ต้อง await params ก่อนเข้าถึง properties
    const paramsData = await params
    console.log("API: POST /api/kpi/[id]/approve - Request received for ID:", paramsData.id)

    // ต้อง await cookies() ก่อนเรียกใช้เมธอด
    const cookieStore = await cookies()
    const allCookies = await cookieStore.getAll()
    console.log(
      "API: POST /api/kpi/[id]/approve - All cookies:",
      allCookies.map((c) => c.name),
    )

    // ต้อง await cookies() ก่อนเรียกใช้เมธอด
    const authToken = await cookieStore.get("auth_token")
    console.log(
      "API: POST /api/kpi/[id]/approve - Auth token:",
      authToken ? `Found (length: ${authToken.value.length})` : "Not found",
    )

    const session = await getServerSession()

    // เพิ่ม log เพื่อตรวจสอบ session และ cookies
    console.log("API: POST /api/kpi/[id]/approve - Session:", session ? `User: ${session.user.username}` : "No session")

    // ตรวจสอบ headers ทั้งหมดที่ได้รับ
    const headers = Object.fromEntries(request.headers.entries())
    console.log("API: POST /api/kpi/[id]/approve - Headers:", headers)

    // ตรวจสอบ cookies ที่ได้รับ
    const cookieHeader = request.headers.get("cookie")
    console.log("API: POST /api/kpi/[id]/approve - Cookie header:", cookieHeader || "Not found")

    if (!session) {
      console.log("API: POST /api/kpi/[id]/approve - No session found, returning 401")
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

    // ตรวจสอบสิทธิ์การอนุมัติ KPI
    if (session.user.role !== "admin" && session.user.role !== "approver") {
      console.log("API: POST /api/kpi/[id]/approve - User does not have permission, returning 403")
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์อนุมัติ KPI" },
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

    const id = Number.parseInt(paramsData.id)
    console.log("API: POST /api/kpi/[id]/approve - Parsed ID:", id)

    if (isNaN(id)) {
      console.log("API: POST /api/kpi/[id]/approve - Invalid ID, returning 400")
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

    console.log("API: POST /api/kpi/[id]/approve - Creating database connection")
    const conn = await createConnection()
    console.log("API: POST /api/kpi/[id]/approve - Database connection established")

    try {
      // ตรวจสอบว่า KPI มีอยู่จริง
      console.log("API: POST /api/kpi/[id]/approve - Checking if KPI exists")
      const [rows] = await conn.execute("SELECT id, status FROM kpis WHERE id = ?", [id])

      const kpis = rows as any[]
      console.log("API: POST /api/kpi/[id]/approve - KPI exists:", kpis.length > 0)

      if (kpis.length === 0) {
        console.log("API: POST /api/kpi/[id]/approve - KPI not found, returning 404")
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

      const kpi = kpis[0]
      console.log("API: POST /api/kpi/[id]/approve - KPI status:", kpi.status)

      // ตรวจสอบว่า KPI ยังไม่ได้อนุมัติ
      if (kpi.status === "approved") {
        console.log("API: POST /api/kpi/[id]/approve - KPI already approved, returning 400")
        return NextResponse.json(
          { error: "KPI นี้ได้รับการอนุมัติแล้ว" },
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

      // อัปเดตสถานะเป็นอนุมัติแล้ว
      console.log("API: POST /api/kpi/[id]/approve - Updating KPI status to approved")
      await conn.execute("UPDATE kpis SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?", [
        session.user.id,
        id,
      ])
      console.log("API: POST /api/kpi/[id]/approve - KPI status updated successfully")

      return NextResponse.json(
        {
          success: true,
          message: "อนุมัติ KPI สำเร็จ",
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
      console.log("API: POST /api/kpi/[id]/approve - Closing database connection")
      await conn.end()
    }
  } catch (error) {
    console.error("API: POST /api/kpi/[id]/approve - Error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอนุมัติ KPI" },
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

