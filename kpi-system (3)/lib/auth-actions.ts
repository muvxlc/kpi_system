"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(username: string, password: string) {
  try {
    // แก้ไข URL ให้เป็น URL เต็ม หรือใช้ URL สัมพัทธ์ที่ถูกต้อง
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "เข้าสู่ระบบไม่สำเร็จ" }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  redirect("/login")
}

