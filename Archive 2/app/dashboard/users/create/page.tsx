import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/user-form"
import { getServerSession } from "@/lib/auth-utils"

export default async function CreateUserPage() {
  const session = await getServerSession()

  // ตรวจสอบสิทธิ์การเข้าถึงหน้าสร้างผู้ใช้ (เฉพาะ admin)
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">เพิ่มผู้ใช้ใหม่</h1>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  )
}

