import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getKpiById } from "@/lib/kpi-service"
import { KpiDetail } from "@/components/kpi-detail"
import { getServerSession } from "@/lib/auth"
import Link from "next/link"
import { Edit, ArrowLeft } from "lucide-react"
import { ApproveKpiButton } from "@/components/approve-kpi-button"

export default async function KpiDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()
  const kpi = await getKpiById(Number.parseInt(params.id))

  if (!kpi) {
    notFound()
  }

  const canEdit = session?.user.role === "admin" || session?.user.id === kpi.onwer1 || session?.user.id === kpi.onwer2

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
            <Link href={`/dashboard/kpi/${params.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                แก้ไข
              </Button>
            </Link>
          )}
          {canApprove && kpi.status !== "approved" && <ApproveKpiButton kpiId={kpi.id} />}
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

