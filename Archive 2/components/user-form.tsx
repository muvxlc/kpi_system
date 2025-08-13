"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface UserFormProps {
  user?: any
  isEditing?: boolean
}

// ประกาศ interface สำหรับข้อมูลที่จะส่งไป API
interface UserUpdateData {
  name: string
  email: string
  role: string
  password?: string // password เป็น optional
}

export function UserForm({ user, isEditing = false }: UserFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: user?.username || "",
    password: "",
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Submitting form data:", isEditing ? "Editing user" : "Creating new user")

      // ใช้ window.location.origin แทน process.env
      const baseUrl = window.location.origin
      console.log("Base URL:", baseUrl)

      if (isEditing) {
        // แก้ไขผู้ใช้
        const url = `${baseUrl}/api/users/${user.id}`
        console.log("PUT request to URL:", url)

        // สร้าง object ใหม่ที่มีเฉพาะข้อมูลที่ต้องการส่ง
        const dataToSend: UserUpdateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }

        // เพิ่ม password เฉพาะเมื่อมีการกรอกข้อมูล
        if (formData.password) {
          dataToSend.password = formData.password
        }

        console.log("Sending data:", JSON.stringify(dataToSend))

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // เพิ่มบรรทัดนี้เพื่อส่ง cookies ไปกับคำขอ
          body: JSON.stringify(dataToSend),
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update user")
        }

        toast({
          title: "บันทึกข้อมูลสำเร็จ",
          description: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว",
        })
      } else {
        // สร้างผู้ใช้ใหม่
        const url = `${baseUrl}/api/users`
        console.log("POST request to URL:", url)

        console.log("Sending data:", JSON.stringify(formData))

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // เพิ่มบรรทัดนี้เพื่อส่ง cookies ไปกับคำขอ
          body: JSON.stringify(formData),
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create user")
        }

        toast({
          title: "บันทึกข้อมูลสำเร็จ",
          description: "สร้างผู้ใช้ใหม่เรียบร้อยแล้ว",
        })
      }

      router.push("/dashboard/users")
      router.refresh()
    } catch (error: any) {
      console.error("Form submission error:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">
            ชื่อผู้ใช้ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isEditing} // ไม่ให้แก้ไขชื่อผู้ใช้ในโหมดแก้ไข
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">รหัสผ่าน {!isEditing && <span className="text-red-500">*</span>}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing} // ไม่บังคับใส่รหัสผ่านในโหมดแก้ไข
            placeholder={isEditing ? "ใส่เฉพาะเมื่อต้องการเปลี่ยนรหัสผ่าน" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            ชื่อ-นามสกุล <span className="text-red-500">*</span>
          </Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">
            บทบาท <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)} required>
            <SelectTrigger id="role">
              <SelectValue placeholder="เลือกบทบาท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
              <SelectItem value="manager">ผู้จัดการ</SelectItem>
              <SelectItem value="approver">ผู้อนุมัติ</SelectItem>
              <SelectItem value="user">ผู้ใช้งาน</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างผู้ใช้"}
        </Button>
      </div>
    </form>
  )
}

