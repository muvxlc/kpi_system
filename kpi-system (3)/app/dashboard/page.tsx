import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getKpiStats } from "@/lib/kpi-service"

export default async function DashboardPage() {
  const stats = await getKpiStats()

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

