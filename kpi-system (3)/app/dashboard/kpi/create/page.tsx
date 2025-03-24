import { KpiForm } from "@/components/kpi-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDepartments, getUsers } from "@/lib/kpi-service"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreateKpiPage() {
  const session = await getServerSession()

  // ตรวจสอบสิทธิ์การสร้าง KPI
  if (session?.user.role !== "admin" && session?.user.role !== "manager") {
    redirect("/dashboard/kpi")
  }

  const departments = await getDepartments()
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">เพิ่ม KPI ใหม่</h1>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <KpiForm departments={departments} users={users} currentUser={session?.user} />
        </CardContent>
      </Card>
    </div>
  )
}

