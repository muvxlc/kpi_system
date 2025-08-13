import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/user-table"
import { Plus } from "lucide-react"
import { getServerSession } from "@/lib/auth-utils"
import { cookies } from "next/headers"

// ดึงรายการผู้ใช้
async function getUsersList({
  page,
  limit,
  search,
}: {
  page: number
  limit: number
  search?: string
}) {
  try {
    console.log("getUsersList: Fetching users list with params:", { page, limit, search })

    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/users`, baseUrl)

    // เพิ่ม query parameters
    url.searchParams.append("page", page.toString())
    url.searchParams.append("limit", limit.toString())
    if (search) url.searchParams.append("search", search)

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

    console.log("getUsersList: Response status:", response.status)

    if (!response.ok) {
      throw new Error(`Failed to fetch users list: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("getUsersList: Data received:", {
      usersCount: data.users?.length || 0,
      total: data.total,
    })

    return data
  } catch (error) {
    console.error("Error fetching users list:", error)
    return { users: [], total: 0 }
  }
}

export default async function UsersListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  console.log("UsersListPage: Starting to render")

  const session = await getServerSession()
  console.log("UsersListPage: Session:", session ? `User: ${session.user.username}` : "No session")

  // ตรวจสอบสิทธิ์การเข้าถึงหน้าผู้ใช้ (เฉพาะ admin)
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  // แก้ไขการใช้ searchParams โดย await ก่อนเข้าถึงค่า
  const params = await searchParams

  const pageParam = params.page
  const searchParam = params.search

  const page = typeof pageParam === "string" ? Number.parseInt(pageParam, 10) : 1
  const limit = 10
  const search = typeof searchParam === "string" ? searchParam : undefined

  console.log("UsersListPage: Params:", { page, limit, search })

  const { users, total } = await getUsersList({ page, limit, search })
  console.log("UsersListPage: Data fetched:", { usersCount: users.length, total })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">รายการผู้ใช้งาน</h1>
        <Link href="/dashboard/users/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มผู้ใช้
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ผู้ใช้งานทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable users={users} total={total} page={page} limit={limit} />
        </CardContent>
      </Card>
    </div>
  )
}

