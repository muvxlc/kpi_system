"use server"

import { createConnection } from "./db"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

interface KpiListParams {
  page?: number
  limit?: number
  group?: string
  dept?: string
}

export async function getKpiList(params: KpiListParams = {}) {
  const { page = 1, limit = 10, group, dept } = params

  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL("/api/kpi", baseUrl)

    // เพิ่ม query parameters
    url.searchParams.append("page", page.toString())
    url.searchParams.append("limit", limit.toString())
    if (group) url.searchParams.append("group", group)
    if (dept) url.searchParams.append("dept", dept)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch KPI list")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching KPI list:", error)
    return { kpis: [], total: 0, groups: [], departments: [] }
  }
}

export async function getKpiById(id: number) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/kpi/${id}`, baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch KPI")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching KPI with ID ${id}:`, error)
    return null
  }
}

export async function createKpi(data: any) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL("/api/kpi", baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to create KPI")
    }

    revalidatePath("/dashboard/kpi")
    return result
  } catch (error) {
    console.error("Error creating KPI:", error)
    throw error
  }
}

export async function updateKpi(id: number, data: any) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/kpi/${id}`, baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to update KPI")
    }

    revalidatePath(`/dashboard/kpi/${id}`)
    revalidatePath("/dashboard/kpi")
    return result
  } catch (error) {
    console.error(`Error updating KPI with ID ${id}:`, error)
    throw error
  }
}

export async function deleteKpi(id: number) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/kpi/${id}`, baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete KPI")
    }

    revalidatePath("/dashboard/kpi")
    return result
  } catch (error) {
    console.error(`Error deleting KPI with ID ${id}:`, error)
    throw error
  }
}

export async function approveKpi(id: number) {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL(`/api/kpi/${id}/approve`, baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to approve KPI")
    }

    revalidatePath(`/dashboard/kpi/${id}`)
    revalidatePath("/dashboard/kpi")
    return result
  } catch (error) {
    console.error(`Error approving KPI with ID ${id}:`, error)
    throw error
  }
}

export async function getKpiStats() {
  try {
    // สร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = new URL("/api/kpi/stats", baseUrl)

    // ดึง cookie เพื่อส่งไปกับ request
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth_token")

    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Cookie: authToken ? `auth_token=${authToken.value}` : "",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch KPI stats")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching KPI stats:", error)
    return { total: 0, pending: 0, approved: 0, departments: 0 }
  }
}

// ฟังก์ชันดึงข้อมูลแผนกโดยตรงจากฐานข้อมูล
export async function getDepartments(): Promise<any[]> {
  try {
    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT id, name FROM departments ORDER BY name")
      return rows as any[]
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

// ฟังก์ชันดึงข้อมูลผู้ใช้โดยตรงจากฐานข้อมูล
export async function getUsers(): Promise<any[]> {
  try {
    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT id, name FROM users ORDER BY name")
      return rows as any[]
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUserById(id: number) {
  try {
    console.log("getUserById: Fetching user with ID:", id)

    // ลองเชื่อมต่อกับฐานข้อมูลโดยตรง
    try {
      const conn = await createConnection()
      console.log("getUserById: Database connection successful")

      try {
        const [rows] = await conn.execute("SELECT id, username, name, email, role FROM users WHERE id = ?", [id])

        const users = rows as any[]
        console.log("getUserById: Direct query result:", users.length > 0 ? "User found" : "User not found")

        if (users.length > 0) {
          console.log("getUserById: User data from direct query:", users[0].username)
          return users[0]
        }

        // ถ้าไม่พบผู้ใช้ ลองดึงรายการผู้ใช้ทั้งหมดเพื่อตรวจสอบ
        const [allUsers] = await conn.execute("SELECT id, username FROM users LIMIT 10")
        console.log(
          "getUserById: Available users:",
          (allUsers as any[]).map((u) => `ID: ${u.id}, Username: ${u.username}`),
        )

        return null
      } finally {
        await conn.end()
        console.log("getUserById: Database connection closed")
      }
    } catch (dbError) {
      console.error("getUserById: Database error:", dbError)

      // ถ้าเชื่อมต่อฐานข้อมูลไม่สำเร็จ ลองใช้ API แทน
      console.log("getUserById: Falling back to API call")

      // สร้าง URL ที่ถูกต้อง
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      const url = new URL(`/api/users/${id}`, baseUrl)
      console.log("getUserById: API URL:", url.toString())

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

      console.log("getUserById: API response status:", response.status)

      if (!response.ok) {
        if (response.status === 404) {
          console.log("getUserById: User not found via API")
          return null
        }
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("getUserById: User data received from API:", data.username)
      return data
    }
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error)
    return null
  }
}

