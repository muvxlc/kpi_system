import { KpiForm } from "@/components/kpi-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDepartments, getUsers } from "@/lib/kpi-service"
import { getServerSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"

export default async function CreateKpiPage() {
  const session = await getServerSession()

  // ตรวจสอบสิทธิ์การสร้าง KPI
  if (!session || (session?.user.role !== "admin" && session?.user.role !== "manager")) {
    redirect("/dashboard/kpi")
  }

  // ใช้ getDepartments และ getUsers โดยตรงจาก lib/kpi-service.ts
  // ซึ่งจะใช้การเชื่อมต่อกับฐานข้อมูลโดยตรงแทนการเรียก API
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

