import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/user-form"
import { getServerSession } from "@/lib/auth-utils"
import { cookies } from "next/headers"

// ดึงข้อมูลผู้ใช้ตาม ID
async function getUserById(id: number) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/users/${id}`, baseUrl)

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

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch user")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error)
    return null
  }
}

// ใช้ interface เพื่อกำหนดรูปแบบของ params
interface PageParams {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: PageParams) {
  const session = await getServerSession()

  // ตรวจสอบสิทธิ์การเข้าถึงหน้าแก้ไขผู้ใช้ (เฉพาะ admin)
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  // แก้ไขตรงนี้: await params ก่อนใช้ params.id
  const paramsData = await params
  const id = Number.parseInt(paramsData.id, 10)
  console.log("Fetching user with ID:", id)

  // ตรวจสอบการเชื่อมต่อกับฐานข้อมูลโดยตรง
  try {
    const conn = await (await import("@/lib/db")).createConnection()
    console.log("Database connection successful")

    try {
      const [rows] = await conn.execute("SELECT id, username, name, email, role FROM users WHERE id = ?", [id])

      const users = rows as any[]
      console.log("Direct DB query result:", users.length > 0 ? "User found" : "User not found")

      if (users.length > 0) {
        console.log("User data:", users[0])
        const user = users[0]

        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">แก้ไขข้อมูลผู้ใช้</h1>
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลผู้ใช้</CardTitle>
              </CardHeader>
              <CardContent>
                <UserForm user={user} isEditing={true} />
              </CardContent>
            </Card>
          </div>
        )
      } else {
        notFound()
      }
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Database error:", error)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">เกิดข้อผิดพลาด</h1>
        <Card>
          <CardContent>
            <p className="text-red-500">ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}

