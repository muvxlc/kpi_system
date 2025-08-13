"use client"

import Link from "next/link"
// ลบการนำเข้าที่ไม่มีอยู่เดิม
// import { useAuth } from "@/lib/auth-context"
// import { UserNav } from "@/components/user-nav"
// import { DashboardNav } from "@/components/dashboard-nav"
// import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  // ลบการใช้ useAuth
  // const { user, loading, logout } = useAuth()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="font-semibold">
          KPI Management System
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {/* ลบการใช้ ModeToggle */}
          {/* <ModeToggle /> */}
          {/* ลบการตรวจสอบ user */}
          {/* {loading ? null : user ? <UserNav user={user} /> : <Link href="/login">เข้าสู่ระบบ</Link>} */}
          <Link href="/login">เข้าสู่ระบบ</Link>
        </div>
      </div>
      {/* ลบการใช้ DashboardNav */}
      {/* {user && <DashboardNav />} */}
    </div>
  )
}

