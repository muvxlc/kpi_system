import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiDetail } from "@/components/kpi-detail"
import { getServerSession } from "@/lib/auth-utils"
import Link from "next/link"
import { Edit, ArrowLeft } from "lucide-react"
import { ApproveKpiButton } from "@/components/approve-kpi-button"
import { UnapproveKpiButton } from "@/components/unapprove-kpi-button"
import { cookies } from "next/headers"

// ใช้ API route แทนการเรียกใช้ mysql2 โดยตรง
// ตรวจสอบการดึงข้อมูล KPI ในหน้ารายละเอียด
// เพิ่ม console.log เพื่อตรวจสอบการทำงาน

async function getKpiById(id: number) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/kpi/${id}`, baseUrl)

    console.log(`Fetching KPI details from: ${url.toString()}`)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = await cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    console.log(`API response status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`KPI with ID ${id} not found`)
        return null
      }
      throw new Error(`Failed to fetch KPI: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`KPI data retrieved successfully for ID: ${id}`)
    return data
  } catch (error) {
    console.error(`Error fetching KPI with ID ${id}:`, error)
    return null
  }
}

export default async function KpiDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()

  if (!session) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">รายละเอียด KPI</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p>กรุณาเข้าสู่ระบบเพื่อดูรายละเอียด KPI</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ต้อง await params ก่อนเข้าถึง properties
  const paramsData = await params
  const id = Number.parseInt(paramsData.id)

  const kpi = await getKpiById(id)

  if (!kpi) {
    notFound()
  }

  const canEdit = session?.user.role === "admin" || session?.user.role === "manager" || session?.user.id === kpi.onwer1 || session?.user.id === kpi.onwer2

  const canApprove = session?.user.role === "admin" || session?.user.role === "approver"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/kpi">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">รายละเอียด KPI</h1>
        <div className="ml-auto flex gap-2">
          {canEdit && (
            <Link href={`/dashboard/kpi/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                แก้ไข
              </Button>
            </Link>
          )}
          {canApprove && kpi.status !== "approved" && <ApproveKpiButton kpiId={kpi.id} />}
          {canApprove && kpi.status === "approved" && <UnapproveKpiButton kpiId={kpi.id} />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{kpi.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <KpiDetail kpi={kpi} />
        </CardContent>
      </Card>
    </div>
  )
}

