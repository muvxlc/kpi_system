"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useAuth() // เพิ่มการใช้ setUser จาก auth context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting login with:", { username }) // ไม่แสดงรหัสผ่าน

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", response.status)

      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok && data.success) {
        // อัปเดตข้อมูลผู้ใช้ใน context ทันทีหลังจากล็อกอินสำเร็จ
        if (data.user) {
          setUser(data.user)
        }

        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "กำลังนำคุณไปยังหน้าแดชบอร์ด",
        })

        // เพิ่มการหน่วงเวลาเล็กน้อยก่อน redirect
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1000)
      } else {
        toast({
          variant: "destructive",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">ชื่อผู้ใช้</Label>
        <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  )
}

