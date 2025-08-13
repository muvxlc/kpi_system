"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface KpiFilterProps {
  groups: any[]
  departments: any[]
  kpiTypes: any[]
}

export function KpiFilter({ groups, departments, kpiTypes }: KpiFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [group, setGroup] = useState("")
  const [dept, setDept] = useState("")
  const [kpiType, setKpiType] = useState("")

  // Initialize state from URL parameters when component mounts
  useEffect(() => {
    const groupParam = searchParams.get("group")
    const deptParam = searchParams.get("dept")
    const kpiTypeParam = searchParams.get("kpiType")

    if (groupParam) setGroup(groupParam)
    if (deptParam) setDept(deptParam)
    if (kpiTypeParam) setKpiType(kpiTypeParam)
  }, [searchParams])

  const handleFilter = () => {
    const params = new URLSearchParams()

    if (group) {
      params.set("group", group)
    }

    if (dept) {
      params.set("dept", dept)
    }

    if (kpiType) {
      params.set("kpiType", kpiType)
    }

    router.push(`/dashboard/kpi?${params.toString()}`)
  }

  const handleReset = () => {
    setGroup("")
    setDept("")
    setKpiType("")
    router.push("/dashboard/kpi")
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="grid gap-2 flex-1">
        <Label htmlFor="kpiType">ประเภท KPI</Label>
        <Select value={kpiType} onValueChange={setKpiType}>
          <SelectTrigger id="kpiType">
            <SelectValue placeholder="เลือกประเภท" />
          </SelectTrigger>
                  <SelectContent>
          <SelectItem value="all">ทั้งหมด</SelectItem>
          {kpiTypes && kpiTypes.length > 0 ? (
            kpiTypes.map((type: any) => (
              <SelectItem key={type.kpi_type} value={type.kpi_type}>
                {type.kpi_type === 'hospital' ? 'Hospital (โรงพยาบาล)' : 'HDC (กระทรวงสาธารณสุข)'}
              </SelectItem>
            ))
          ) : (
            <>
              <SelectItem value="hospital">Hospital (โรงพยาบาล)</SelectItem>
              <SelectItem value="hdc">HDC (กระทรวงสาธารณสุข)</SelectItem>
            </>
          )}
        </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 flex-1">
        <Label htmlFor="group">กลุ่ม KPI</Label>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger id="group">
            <SelectValue placeholder="เลือกกลุ่ม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {groups.map((group: any) => (
              <SelectItem key={group.group} value={group.group}>
                {group.group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 flex-1">
        <Label htmlFor="dept">แผนก</Label>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger id="dept">
            <SelectValue placeholder="เลือกแผนก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {departments.map((dept: any) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2">
        <Button onClick={handleFilter}>กรอง</Button>
        <Button variant="outline" onClick={handleReset}>
          รีเซ็ต
        </Button>
      </div>
    </div>
  )
}

