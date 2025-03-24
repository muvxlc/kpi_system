"use server"

import { createConnection } from "./db"
import { revalidatePath } from "next/cache"

interface KpiListParams {
  page?: number
  limit?: number
  group?: string
  dept?: string
}

export async function getKpiList(params: KpiListParams = {}) {
  const { page = 1, limit = 10, group, dept } = params

  try {
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi`)

    apiUrl.searchParams.append("page", page.toString())
    apiUrl.searchParams.append("limit", limit.toString())

    if (group) {
      apiUrl.searchParams.append("group", group)
    }

    if (dept) {
      apiUrl.searchParams.append("dept", dept)
    }

    const response = await fetch(apiUrl, { cache: "no-store" })

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi/${id}`, { cache: "no-store" })

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi/${id}`, {
      method: "DELETE",
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi/${id}/approve`, {
      method: "POST",
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/kpi/stats`, { cache: "no-store" })

    if (!response.ok) {
      throw new Error("Failed to fetch KPI stats")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching KPI stats:", error)
    return { total: 0, pending: 0, approved: 0, departments: 0 }
  }
}

export async function getDepartments() {
  try {
    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT id, name FROM departments ORDER BY name")
      return rows
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

export async function getUsers() {
  try {
    const conn = await createConnection()

    try {
      const [rows] = await conn.execute("SELECT id, name FROM users ORDER BY name")
      return rows
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

