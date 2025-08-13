import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "@/lib/auth-utils"
import { cookies } from "next/headers"

// ใช้ API route แทนการเรียกใช้ mysql2 โดยตรง
async function getKpiStats() {
  try {
    console.log("getKpiStats: Fetching KPI stats")

    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL("/api/kpi/stats", baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    console.log("getKpiStats: Response status:", response.status)

    if (!response.ok) {
      throw new Error(`Failed to fetch KPI stats: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("getKpiStats: Data received:", data)

    return data
  } catch (error) {
    console.error("Dashboard: Error fetching KPI stats:", error)
    return { total: 0, pending: 0, approved: 0, departments: 0 }
  }
}

export default async function DashboardPage() {
  let stats

  try {
    const session = await getServerSession()
    if (!session) {
      console.log("Dashboard: No session found")
      stats = { total: 0, pending: 0, approved: 0, departments: 0 }
    } else {
      console.log("Dashboard: Session found for user:", session.user.username)
      stats = await getKpiStats()
      console.log("Dashboard: KPI stats fetched successfully:", stats)
    }
  } catch (error) {
    console.error("Dashboard: Error fetching KPI stats:", error)
    stats = { total: 0, pending: 0, approved: 0, departments: 0 }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ด</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KPI ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">แผนก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

