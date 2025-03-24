import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiTable } from "@/components/kpi-table"
import { KpiFilter } from "@/components/kpi-filter"
import { Plus } from "lucide-react"
import { getServerSession } from "@/lib/auth-utils"
import { cookies } from "next/headers"

// ใช้ API route แทนการเรียกใช้ mysql2 โดยตรง
async function getKpiList({
  page,
  limit,
  group,
  dept,
}: {
  page: number
  limit: number
  group?: string
  dept?: string
}) {
  try {
    console.log("getKpiList: Fetching KPI list with params:", { page, limit, group, dept })

    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/kpi`, baseUrl)

    // เพิ่ม query parameters
    url.searchParams.append("page", page.toString())
    url.searchParams.append("limit", limit.toString())
    if (group) url.searchParams.append("group", group)
    if (dept) url.searchParams.append("dept", dept)

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

    console.log("getKpiList: Response status:", response.status)

    if (!response.ok) {
      throw new Error(`Failed to fetch KPI list: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("getKpiList: Data received:", {
      kpisCount: data.kpis?.length || 0,
      total: data.total,
      groupsCount: data.groups?.length || 0,
      departmentsCount: data.departments?.length || 0,
    })

    return data
  } catch (error) {
    console.error("Error fetching KPI list:", error)
    return { kpis: [], total: 0, groups: [], departments: [] }
  }
}

export default async function KpiListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  console.log("KpiListPage: Starting to render")

  const session = await getServerSession()
  console.log("KpiListPage: Session:", session ? `User: ${session.user.username}` : "No session")

  if (!session) {
    console.log("KpiListPage: No session, showing login prompt")
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">รายการ KPI</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p>กรุณาเข้าสู่ระบบเพื่อดูรายการ KPI</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // แก้ไขการใช้ searchParams โดย await ก่อนเข้าถึงค่า
  const params = await searchParams

  const pageParam = params.page
  const groupParam = params.group
  const deptParam = params.dept

  const page = typeof pageParam === "string" ? Number.parseInt(pageParam, 10) : 1
  const limit = 10
  const group = typeof groupParam === "string" ? groupParam : undefined
  const dept = typeof deptParam === "string" ? deptParam : undefined

  console.log("KpiListPage: Params:", { page, limit, group, dept })

  const { kpis, total, groups, departments } = await getKpiList({ page, limit, group, dept })
  console.log("KpiListPage: Data fetched:", { kpisCount: kpis.length, total })

  const canCreate = session?.user.role === "admin" || session?.user.role === "manager"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">รายการ KPI</h1>
        {canCreate && (
          <Link href="/dashboard/kpi/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่ม KPI
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <KpiFilter groups={groups} departments={departments} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <KpiTable kpis={kpis} total={total} page={page} limit={limit} userRole={session?.user.role || "user"} />
        </CardContent>
      </Card>
    </div>
  )
}

