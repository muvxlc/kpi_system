import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"
import { cookies } from "next/headers"

// ยกเลิกการอนุมัติ KPI
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ต้อง await params ก่อนเข้าถึง properties
    const id = Number.parseInt(params.id)
    console.log("API: POST /api/kpi/[id]/unapprove - Request received for ID:", id)

    // ต้อง await cookies() ก่อนเรียกใช้เมธอด
    const cookieStore = cookies()
    const allCookies = (await cookieStore).getAll()
    console.log(
      "API: POST /api/kpi/[id]/unapprove - All cookies:",
      allCookies.map((c) => c.name),
    )

    // ต้อง await cookies() ก่อนเรียกใช้เมธอด
    const authToken = (await cookieStore).get("auth_token")
    console.log(
      "API: POST /api/kpi/[id]/unapprove - Auth token:",
      authToken ? `Found (length: ${authToken.value.length})` : "Not found",
    )

    const session = await getServerSession()

    // เพิ่ม log เพื่อตรวจสอบ session และ cookies
    console.log(
      "API: POST /api/kpi/[id]/unapprove - Session:",
      session ? `User: ${session.user.username}` : "No session",
    )

    // ตรวจสอบ headers ทั้งหมดที่ได้รับ
    const headers = Object.fromEntries(request.headers.entries())
    console.log("API: POST /api/kpi/[id]/unapprove - Headers:", headers)

    // ตรวจสอบ cookies ที่ได้รับ
    const cookieHeader = request.headers.get("cookie")
    console.log("API: POST /api/kpi/[id]/unapprove - Cookie header:", cookieHeader || "Not found")

    if (!session) {
      console.log("API: POST /api/kpi/[id]/unapprove - No session found, returning 401")
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

    // ตรวจสอบสิทธิ์การยกเลิกอนุมัติ KPI
    if (session.user.role !== "admin" && session.user.role !== "approver") {
      console.log("API: POST /api/kpi/[id]/unapprove - User does not have permission, returning 403")
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์ยกเลิกการอนุมัติ KPI" },
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

    if (isNaN(id)) {
      console.log("API: POST /api/kpi/[id]/unapprove - Invalid ID, returning 400")
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

    console.log("API: POST /api/kpi/[id]/unapprove - Creating database connection")
    const conn = await createConnection()
    console.log("API: POST /api/kpi/[id]/unapprove - Database connection established")

    try {
      // ตรวจสอบว่า KPI มีอยู่จริง
      console.log("API: POST /api/kpi/[id]/unapprove - Checking if KPI exists")
      const [rows] = await conn.execute("SELECT id, status FROM kpis WHERE id = ?", [id])

      const kpis = rows as any[]
      console.log("API: POST /api/kpi/[id]/unapprove - KPI exists:", kpis.length > 0)

      if (kpis.length === 0) {
        console.log("API: POST /api/kpi/[id]/unapprove - KPI not found, returning 404")
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
      console.log("API: POST /api/kpi/[id]/unapprove - KPI status:", kpi.status)

      // ตรวจสอบว่า KPI ได้รับการอนุมัติแล้ว
      if (kpi.status !== "approved") {
        console.log("API: POST /api/kpi/[id]/unapprove - KPI not approved yet, returning 400")
        return NextResponse.json(
          { error: "KPI นี้ยังไม่ได้รับการอนุมัติ" },
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

      // อัปเดตสถานะเป็นรออนุมัติ
      console.log("API: POST /api/kpi/[id]/unapprove - Updating KPI status to pending")
      await conn.execute("UPDATE kpis SET status = 'pending', approved_by = NULL, approved_at = NULL WHERE id = ?", [
        id,
      ])
      console.log("API: POST /api/kpi/[id]/unapprove - KPI status updated successfully")

      return NextResponse.json(
        {
          success: true,
          message: "ยกเลิกการอนุมัติ KPI สำเร็จ",
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
      console.log("API: POST /api/kpi/[id]/unapprove - Closing database connection")
      await conn.end()
    }
  } catch (error) {
    console.error("API: POST /api/kpi/[id]/unapprove - Error:", error)
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการยกเลิกการอนุมัติ KPI" },
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

