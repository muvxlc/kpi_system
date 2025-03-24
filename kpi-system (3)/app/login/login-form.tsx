"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/lib/auth-actions"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(username, password)

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        })
      }
    } catch (error) {
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

