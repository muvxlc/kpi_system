"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, Home, Settings, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "แดชบอร์ด",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "manager", "approver", "user"],
  },
  {
    title: "จัดการ KPI",
    href: "/dashboard/kpi",
    icon: FileText,
    roles: ["admin", "manager", "approver", "user"],
  },
  {
    title: "รายงาน",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["admin", "manager", "approver"],
  },
  {
    title: "ผู้ใช้งาน",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "ตั้งค่า",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin"],
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // กรองรายการเมนูตามสิทธิ์ของผู้ใช้
  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <nav className="grid items-start gap-2 p-4">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
            pathname === item.href ? "bg-muted text-primary font-medium" : "text-muted-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

