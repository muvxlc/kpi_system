import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiTable } from "@/components/kpi-table"
import { KpiFilter } from "@/components/kpi-filter"
import { Plus } from "lucide-react"
import { getKpiList } from "@/lib/kpi-service"
import { getServerSession } from "@/lib/auth"

export default async function KpiListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession()
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const limit = 10
  const group = typeof searchParams.group === "string" ? searchParams.group : undefined
  const dept = typeof searchParams.dept === "string" ? searchParams.dept : undefined

  const { kpis, total, groups, departments } = await getKpiList({ page, limit, group, dept })

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

