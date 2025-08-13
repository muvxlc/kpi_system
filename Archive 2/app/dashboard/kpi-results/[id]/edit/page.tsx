"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftIcon, SaveIcon, LoaderIcon } from "lucide-react"

interface KPIResult {
  id: number
  kpi_id: number
  kpi_title: string
  fiscal_year: number
  period: string
  period_start: string
  period_end: string
  actual_value: number
  target_value: number
  achievement_percentage: number
  data_source: 'manual' | 'query'
  query_condition: string
  note: string
  status: string
}

export default function EditKPIResultPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<KPIResult | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Form fields
  const [actualValue, setActualValue] = useState<string>("")
  const [targetValue, setTargetValue] = useState<string>("")
  const [actualValueType, setActualValueType] = useState<'number' | 'percentage'>('number')
  const [targetValueType, setTargetValueType] = useState<'number' | 'percentage'>('number')
  const [queryCondition, setQueryCondition] = useState<string>("")
  const [note, setNote] = useState<string>("")

  useEffect(() => {
    if (params.id) {
      fetchResult(parseInt(params.id as string))
    }
  }, [params.id])

  const fetchResult = async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/kpi-results/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        const resultData = data.result
        
        setResult(resultData)
        
        // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
        if (resultData.actual_value !== null) {
          if (resultData.actual_value < 1 && resultData.actual_value > 0) {
            setActualValue((resultData.actual_value * 100).toFixed(2))
            setActualValueType('percentage')
          } else {
            setActualValue(resultData.actual_value.toFixed(2))
            setActualValueType('number')
          }
        }
        
        if (resultData.target_value !== null) {
          if (resultData.target_value < 1 && resultData.target_value > 0) {
            setTargetValue((resultData.target_value * 100).toFixed(2))
            setTargetValueType('percentage')
          } else {
            setTargetValue(resultData.target_value.toFixed(2))
            setTargetValueType('number')
          }
        }
        
        setQueryCondition(resultData.query_condition || "")
        setNote(resultData.note || "")
      } else {
        setError("ไม่สามารถดึงข้อมูลได้")
      }
    } catch (error) {
      console.error("Error fetching result:", error)
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      if (!result) return

      // แปลงค่าจาก % เป็นทศนิยม
      const parseValue = (value: string, type: 'number' | 'percentage'): number | null => {
        if (!value) return null
        const numValue = parseFloat(value)
        if (isNaN(numValue)) return null
        return type === 'percentage' ? numValue / 100 : numValue
      }

      const updateData = {
        actual_value: parseValue(actualValue, actualValueType),
        target_value: parseValue(targetValue, targetValueType),
        query_condition: queryCondition,
        note
      }

      const response = await fetch(`/api/kpi-results/${result.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setSuccess("อัปเดตผลลัพธ์ KPI สำเร็จ")
        setTimeout(() => {
          router.push('/dashboard/kpi-results')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล")
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการอัปเดตข้อมูล")
      console.error('Submit error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <LoaderIcon className="w-8 h-8 animate-spin" />
          <span className="ml-2">กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>ไม่พบข้อมูลผลลัพธ์ KPI</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          กลับ
        </Button>
        <h1 className="text-3xl font-bold">แก้ไขผลลัพธ์ KPI</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* KPI Information */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล KPI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">ชื่อ KPI</Label>
              <p className="text-sm text-muted-foreground">{result.kpi_title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ปีงบประมาณ</Label>
              <p className="text-sm text-muted-foreground">ปีงบประมาณ {result.fiscal_year}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">รอบการรายงาน</Label>
              <p className="text-sm text-muted-foreground">
                {result.period === '3months' ? 'รอบ 3 เดือน' :
                 result.period === '6months' ? 'รอบ 6 เดือน' :
                 result.period === '9months' ? 'รอบ 9 เดือน' :
                 result.period === 'yearly' ? 'รอบปีงบประมาณ' : result.period}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">แหล่งข้อมูล</Label>
              <p className="text-sm text-muted-foreground">
                {result.data_source === 'manual' ? 'กรอกเอง' : 'Query จากระบบ'}
              </p>
            </div>
          </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">ช่วงเวลา</Label>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    // ใช้การคำนวณที่ถูกต้องแทนการดึงจาก database
                    const getPeriodRange = (fiscalYear: number, period: string) => {
                      const startYear = fiscalYear - 543 - 1
                      const fiscalStart = new Date(startYear, 9, 1) // 1 ตุลาคม
                      
                      switch (period) {
                        case '3months':
                          return {
                            start: fiscalStart,
                            end: new Date(startYear, 11, 31) // 31 ธันวาคม
                          }
                        case '6months':
                          return {
                            start: fiscalStart,
                            end: new Date(startYear + 1, 2, 31) // 31 มีนาคม
                          }
                        case '9months':
                          return {
                            start: fiscalStart,
                            end: new Date(startYear + 1, 5, 30) // 30 มิถุนายน
                          }
                        case 'yearly':
                          return {
                            start: fiscalStart,
                            end: new Date(startYear + 1, 8, 30) // 30 กันยายน
                          }
                        default:
                          return { start: fiscalStart, end: fiscalStart }
                      }
                    }
                    
                    const range = getPeriodRange(result.fiscal_year, result.period)
                    return `${range.start.toLocaleDateString('th-TH')} - ${range.end.toLocaleDateString('th-TH')}`
                  })()}
                </p>
              </div>
            <div>
              <Label className="text-sm font-medium">สถานะ</Label>
              <p className="text-sm text-muted-foreground">
                {result.status === 'draft' ? 'ร่าง' :
                 result.status === 'submitted' ? 'ส่งแล้ว' :
                 result.status === 'approved' ? 'อนุมัติแล้ว' :
                 result.status === 'rejected' ? 'ไม่อนุมัติ' : result.status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Values */}
        <Card>
          <CardHeader>
            <CardTitle>ค่าผลลัพธ์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualValue">ค่าจริงที่ได้</Label>
                <div className="flex gap-2">
                  <Input
                    id="actualValue"
                    type="number"
                    step="0.01"
                    placeholder="กรอกค่าจริง"
                    value={actualValue}
                    onChange={(e) => setActualValue(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={actualValueType} onValueChange={(value: 'number' | 'percentage') => setActualValueType(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">ตัวเลข</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {actualValueType === 'percentage' && (
                  <p className="text-xs text-muted-foreground">กรอกเป็น % (เช่น 85.5 = 85.5%)</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetValue">ค่าเป้าหมาย</Label>
                <div className="flex gap-2">
                  <Input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    placeholder="กรอกค่าเป้าหมาย"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={targetValueType} onValueChange={(value: 'number' | 'percentage') => setTargetValueType(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">ตัวเลข</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {targetValueType === 'percentage' && (
                  <p className="text-xs text-muted-foreground">กรอกเป็น % (เช่น 90.0 = 90%)</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Query Information - แสดงเฉพาะเมื่อเป็น query result */}
        {result.data_source === 'query' && (
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูล Query</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="queryCondition">เงื่อนไขการ Query</Label>
                <Textarea
                  id="queryCondition"
                  placeholder="ระบุเงื่อนไขหรือพารามิเตอร์เพิ่มเติม"
                  value={queryCondition}
                  onChange={(e) => setQueryCondition(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  แก้ไขเงื่อนไขการ query เพื่อปรับผลลัพธ์
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="note">หมายเหตุ</Label>
              <Textarea
                id="note"
                placeholder="ระบุหมายเหตุหรือคำอธิบายเพิ่มเติม"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={saving}>
            <SaveIcon className="w-4 h-4 mr-2" />
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </form>
    </div>
  )
}
