import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiForm } from "@/components/kpi-form"
import { getServerSession } from "@/lib/auth-utils"
import { getDepartments, getUsers, getKpiById } from "@/lib/kpi-service"

export default async function EditKpiPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // ต้อง await params ก่อนเข้าถึง properties
  const paramsData = await params
  const id = Number.parseInt(paramsData.id)

  console.log(`Edit page: Fetching KPI with ID ${id}`)

  const kpi = await getKpiById(id)

  console.log(`Edit page: KPI found: ${kpi ? "Yes" : "No"}`)

  if (!kpi) {
    notFound()
  }

  // ตรวจสอบสิทธิ์การแก้ไข KPI
  const canEdit = session?.user.role === "admin" || session?.user.role === "manager" || session?.user.id === kpi.onwer1 || session?.user.id === kpi.onwer2

  if (!canEdit) {
    redirect(`/dashboard/kpi/${id}`)
  }

  // ใช้ getDepartments และ getUsers โดยตรงจาก lib/kpi-service.ts
  // ซึ่งจะใช้การเชื่อมต่อกับฐานข้อมูลโดยตรงแทนการเรียก API
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

