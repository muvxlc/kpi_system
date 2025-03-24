"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DatePicker } from "@/components/ui/date-picker"

interface Department {
  id: number | string
  name: string
}

interface User {
  id: number | string
  name: string
}

interface KpiFormProps {
  kpi?: any
  departments: Department[]
  users: User[]
  currentUser: any
}

export function KpiForm({ kpi, departments, users, currentUser }: KpiFormProps) {
  const isEditing = !!kpi
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    group: kpi?.group || "",
    plan: kpi?.plan || "",
    project: kpi?.project || "",
    title: kpi?.title || "",
    titleEn: kpi?.titleEn || "",
    detail: kpi?.detail || "",
    objective: kpi?.objective || "",
    xfunction: kpi?.xfunction || "",
    var_a: kpi?.var_a || "",
    var_b: kpi?.var_b || "",
    icd_code: kpi?.icd_code || "",
    round: kpi?.round || "",
    measure: kpi?.measure || "",
    goal: kpi?.goal || "",
    alert: kpi?.alert || "",
    benchmark: kpi?.benchmark || "",
    method: kpi?.method || "",
    ref: kpi?.ref || "",
    date_start: kpi?.date_start ? new Date(kpi.date_start) : new Date(),
    dept: kpi?.dept || "",
    onwer1: kpi?.onwer1 || currentUser?.id || "",
    onwer2: kpi?.onwer2 || "",
    note: kpi?.note || "",
    image: kpi?.image || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date_start: date }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // สร้าง URL ที่ถูกต้อง
      const baseUrl = window.location.origin
      console.log("Form submission URL base:", baseUrl)

      if (isEditing) {
        const url = new URL(`/api/kpi/${kpi.id}`, baseUrl)
        console.log("PUT request to URL:", url.toString())

        const response = await fetch(url.toString(), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin", // เพิ่ม credentials: same-origin เพื่อส่ง cookies
          body: JSON.stringify({
            ...formData,
            // แปลงวันที่เป็นรูปแบบที่ MySQL เข้าใจได้
            date_start: formData.date_start ? formData.date_start.toISOString().slice(0, 19).replace("T", " ") : null,
          }),
        })

        console.log("Edit response status:", response.status)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update KPI")
        }

        toast({
          title: "บันทึกข้อมูลสำเร็จ",
          description: "อัปเดตข้อมูล KPI เรียบร้อยแล้ว",
        })

        router.push(`/dashboard/kpi/${kpi.id}`)
        router.refresh()
      } else {
        const url = new URL("/api/kpi", baseUrl)

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            // แปลงวันที่เป็นรูปแบบที่ MySQL เข้าใจได้
            date_start: formData.date_start ? formData.date_start.toISOString().slice(0, 19).replace("T", " ") : null,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create KPI")
        }

        const result = await response.json()

        toast({
          title: "บันทึกข้อมูลสำเร็จ",
          description: "สร้าง KPI ใหม่เรียบร้อยแล้ว",
        })

        router.push(`/dashboard/kpi/${result.id}`)
        router.refresh()
      }
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
          <Label htmlFor="title">
            หัวข้อ KPI <span className="text-red-500">*</span>
          </Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleEn">หัวข้อภาษาอังกฤษ</Label>
          <Input id="titleEn" name="titleEn" value={formData.titleEn} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group">
            หมวด KPI <span className="text-red-500">*</span>
          </Label>
          <Input id="group" name="group" value={formData.group} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dept">
            แผนก <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.dept.toString()}
            onValueChange={(value) => handleSelectChange("dept", value)}
            required
          >
            <SelectTrigger id="dept">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan">แผน</Label>
          <Input id="plan" name="plan" value={formData.plan} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">โครงการ</Label>
          <Input id="project" name="project" value={formData.project} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="onwer1">
            เจ้าของหลัก <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.onwer1.toString()}
            onValueChange={(value) => handleSelectChange("onwer1", value)}
            required
          >
            <SelectTrigger id="onwer1">
              <SelectValue placeholder="เลือกเจ้าของหลัก" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="onwer2">เจ้าของร่วม</Label>
          <Select value={formData.onwer2.toString()} onValueChange={(value) => handleSelectChange("onwer2", value)}>
            <SelectTrigger id="onwer2">
              <SelectValue placeholder="เลือกเจ้าของร่วม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ไม่มี</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_start">วันที่เริ่มต้น</Label>
          <DatePicker date={formData.date_start} onSelect={handleDateChange} placeholder="เลือกวันที่" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detail">รายละเอียด</Label>
        <Textarea id="detail" name="detail" value={formData.detail} onChange={handleChange} rows={18} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="objective">วัตถุประสงค์</Label>
          <Textarea id="objective" name="objective" value={formData.objective} onChange={handleChange} rows={4}/>
        </div>

        <div className="space-y-2">
          <Label htmlFor="xfunction">ฟังก์ชัน</Label>
          <Input id="xfunction" name="xfunction" value={formData.xfunction} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="var_a">ตัวแปร A</Label>
          <Input id="var_a" name="var_a" value={formData.var_a} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="var_b">ตัวแปร B</Label>
          <Input id="var_b" name="var_b" value={formData.var_b} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icd_code">รหัส ICD</Label>
          <Input id="icd_code" name="icd_code" value={formData.icd_code} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="round">รอบ</Label>
          <Input id="round" name="round" value={formData.round} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measure">การวัดผล</Label>
          <Input id="measure" name="measure" value={formData.measure} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">เป้าหมาย</Label>
          <Input id="goal" name="goal" value={formData.goal} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alert">การแจ้งเตือน</Label>
          <Input id="alert" name="alert" value={formData.alert} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="benchmark">เกณฑ์เปรียบเทียบ</Label>
          <Input id="benchmark" name="benchmark" value={formData.benchmark} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">วิธีการ</Label>
          <Input id="method" name="method" value={formData.method} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ref">อ้างอิง</Label>
          <Input id="ref" name="ref" value={formData.ref} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">หมายเหตุ</Label>
        <Textarea id="note" name="note" value={formData.note} onChange={handleChange} rows={2} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้าง KPI"}
        </Button>
      </div>
    </form>
  )
}

