import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getKpiById, getDepartments, getUsers } from "@/lib/kpi-service"
import { KpiForm } from "@/components/kpi-form"
import { getServerSession } from "@/lib/auth"

export default async function EditKpiPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()
  const kpi = await getKpiById(Number.parseInt(params.id))

  if (!kpi) {
    notFound()
  }

  // ตรวจสอบสิทธิ์การแก้ไข KPI
  const canEdit = session?.user.role === "admin" || session?.user.id === kpi.onwer1 || session?.user.id === kpi.onwer2

  if (!canEdit) {
    redirect(`/dashboard/kpi/${params.id}`)
  }

  const departments = await getDepartments()
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">แก้ไข KPI</h1>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <KpiForm kpi={kpi} departments={departments} users={users} currentUser={session?.user} />
        </CardContent>
      </Card>
    </div>
  )
}

