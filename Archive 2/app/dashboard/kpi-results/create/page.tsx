"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftIcon, SaveIcon, DatabaseIcon, PenIcon, LoaderIcon } from "lucide-react"
import { getRecentFiscalYears, getPeriodRange, getPeriodName } from "@/lib/fiscal-year-utils"

interface KPI {
  id: number
  title: string
  goal: string
  measure: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
}

interface QueryTemplate {
  id: number
  name: string
  description: string
  query_type: 'sql' | 'api' | 'file'
  query_template: string
  parameters: string[]
}

export default function CreateKPIResultPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [queryTemplates, setQueryTemplates] = useState<QueryTemplate[]>([])
  const [selectedKPI, setSelectedKPI] = useState<string>("")
  const [fiscalYear, setFiscalYear] = useState<number>(getRecentFiscalYears()[0])
  const [period, setPeriod] = useState<'3' | '6' | '9' | '12'>('3')
  // Manual input fields
  const [actualValue, setActualValue] = useState<string>("")
  const [targetValue, setTargetValue] = useState<string>("")
  const [actualValueType, setActualValueType] = useState<'number' | 'percentage'>('number')
  const [targetValueType, setTargetValueType] = useState<'number' | 'percentage'>('number')
  
  // Query fields
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [queryCondition, setQueryCondition] = useState<string>("")
  const [queryResult, setQueryResult] = useState<string>("")
  const [dataSource, setDataSource] = useState<'manual' | 'query'>('manual')
  const [queryType, setQueryType] = useState<string>("")
  const [queryParams, setQueryParams] = useState<{start_date?: string, end_date?: string}>({})
  const [isQuerying, setIsQuerying] = useState(false)
  
  // Common fields
  const [note, setNote] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  
  // ตัวแปร a, b สำหรับการคำนวณ
  const [variableA, setVariableA] = useState<string>("")
  const [variableB, setVariableB] = useState<string>("")

  const fiscalYears = getRecentFiscalYears()

  useEffect(() => {
    // ตรวจสอบสิทธิ์การเข้าถึง
    if (user && !['admin', 'manager', 'staff'].includes(user.role)) {
      router.push('/dashboard')
      return
    }
    
    fetchKPIs()
    fetchQueryTemplates()
  }, [user, router])

  // useEffect สำหรับการตั้งค่า target value เมื่อเลือก KPI
  useEffect(() => {
    if (selectedKPI && kpis.length > 0) {
      const kpi = kpis.find(k => k.id.toString() === selectedKPI)
      if (kpi?.target) {
        const targetValue = parseFloat(kpi.target)
        if (!isNaN(targetValue)) {
          if (targetValue >= 0 && targetValue <= 1) {
            setTargetValue((targetValue * 100).toFixed(2))
            setTargetValueType('percentage')
          } else {
            setTargetValue(targetValue.toFixed(2))
            setTargetValueType('number')
          }
          console.log('Target value set from KPI selection:', {
            kpiId: kpi.id,
            kpiTitle: kpi.title,
            target: kpi.target,
            targetValue: targetValue,
            targetValueType: targetValue >= 0 && targetValue <= 1 ? 'percentage' : 'number'
          })
        }
      } else {
        console.log('No target value found for KPI:', kpi)
      }
    }
  }, [selectedKPI, kpis])

  useEffect(() => {
    if (selectedKPI && fiscalYear && period) {
      // คำนวณช่วงเวลาอัตโนมัติ
      const range = getPeriodRange(fiscalYear, period)
      console.log('Period range:', range)
    }
  }, [selectedKPI, fiscalYear, period])

  const fetchKPIs = async () => {
    try {
      const response = await fetch('/api/kpi')
      if (response.ok) {
        const data = await response.json()
        setKpis(data.kpis || [])
        
        // ตั้งค่า target value เริ่มต้นหากมี KPI ที่เลือกอยู่แล้ว
        if (selectedKPI && data.kpis) {
          const kpi = data.kpis.find((k: any) => k.id.toString() === selectedKPI)
          if (kpi?.target) {
            const targetValue = parseFloat(kpi.target)
            if (!isNaN(targetValue)) {
              if (targetValue >= 0 && targetValue <= 1) {
                setTargetValue((targetValue * 100).toFixed(2))
                setTargetValueType('percentage')
              } else {
                setTargetValue(targetValue.toFixed(2))
                setTargetValueType('number')
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    }
  }

  const fetchQueryTemplates = async () => {
    try {
      const response = await fetch('/api/kpi-query-templates')
      if (response.ok) {
        const data = await response.json()
        setQueryTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching query templates:', error)
      // ถ้าไม่มี API ให้สร้างข้อมูลตัวอย่าง
      setQueryTemplates([
        {
          id: 1,
          name: 'Query จากฐานข้อมูล HDC',
          description: 'ดึงข้อมูลจากระบบ HDC ของกระทรวงสาธารณสุข',
          query_type: 'hdc',
          query_template: 'maternal_mortality',
          parameters: ['period_start', 'period_end']
        },
        {
          id: 2,
          name: 'Query จากระบบ MIS',
          description: 'ดึงข้อมูลจากระบบจัดการข้อมูล',
          query_type: 'mis',
          query_template: 'operating_expenses',
          parameters: ['period_start', 'period_end']
        }
      ])
    }
  }

  const executeQuery = async () => {
    if (!queryType || !dataSource) {
      alert('กรุณาเลือกประเภทและแหล่งข้อมูล')
      return
    }

    setIsQuerying(true)
    try {
      // หา template ที่เลือกเพื่อดึง query_type
      const template = queryTemplates.find(t => t.id.toString() === selectedTemplate)
      if (!template) {
        alert('ไม่พบ template ที่เลือก')
        return
      }
      
      const response = await fetch('/api/kpi-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryType: template.query_template,
          queryParams: queryParams,
          dataSource: template.query_type
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setQueryResult(data.result.value.toFixed(2))
        alert(`Query สำเร็จ: ${data.result.description}\nค่า: ${data.result.value.toFixed(2)} ${data.result.unit}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'เกิดข้อผิดพลาดในการ query')
      }
    } catch (error) {
      console.error('Query error:', error)
      alert('เกิดข้อผิดพลาดในการ query')
    } finally {
      setIsQuerying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!selectedKPI || !fiscalYear || !period) {
        setError("กรุณากรอกข้อมูลให้ครบถ้วน")
        return
      }

      // ตรวจสอบว่า KPI ที่เลือกเป็น KPI ที่อนุมัติแล้วหรือไม่
      const selectedKPIObj = kpis.find(k => k.id.toString() === selectedKPI)
      if (!selectedKPIObj || selectedKPIObj.status !== 'approved') {
        setError("KPI ที่เลือกไม่อนุมัติหรือไม่มีอยู่ กรุณาเลือก KPI ที่อนุมัติแล้ว")
        return
      }

      const range = getPeriodRange(fiscalYear, period)
      
      // แปลงค่าจาก % เป็นทศนิยม
      const parseValue = (value: string, type: 'number' | 'percentage'): number | null => {
        console.log('parseValue Debug:', { value, type, hasValue: !!value })
        if (!value) {
          console.log('parseValue: No value provided, returning null')
          return null
        }
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          console.log('parseValue: Invalid number, returning null')
          return null
        }
        const result = type === 'percentage' ? numValue / 100 : numValue
        console.log('parseValue: Result:', { numValue, type, result })
        return result
      }

      const resultData = {
        kpi_id: parseInt(selectedKPI),
        fiscal_year: fiscalYear,
        period,
        period_start: range.start.toISOString().split('T')[0],
        period_end: range.end.toISOString().split('T')[0],
        actual_value: dataSource === 'manual' ? parseValue(actualValue, actualValueType) : parseValue(queryResult, 'number'),
        target_value: parseValue(targetValue, targetValueType), // ใช้ค่าเป้าหมายเสมอ ไม่ว่าจะเป็น manual หรือ query
        data_source: dataSource,
        query_condition: dataSource === 'query' ? queryCondition : null,
        variable_a: variableA ? parseFloat(variableA) : null,
        variable_b: variableB ? parseFloat(variableB) : null,
        note
      }

      console.log('Submit Debug - Data being sent:', {
        resultData,
        targetValue,
        targetValueType,
        parseValue: parseValue(targetValue, targetValueType),
        selectedKPI,
        kpis: kpis.map(k => ({ id: k.id, title: k.title, goal: k.goal }))
      })

      const response = await fetch('/api/kpi-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      })

      if (response.ok) {
        setSuccess("บันทึกผลลัพธ์ KPI สำเร็จ")
        setTimeout(() => {
          router.push('/dashboard/kpi-results')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedKPIGoal = () => {
    const kpi = kpis.find(k => k.id.toString() === selectedKPI)
    return kpi?.goal || ''
  }

  const getSelectedKPIMeasure = () => {
    const kpi = kpis.find(k => k.id.toString() === selectedKPI)
    return kpi?.measure || ''
  }

  const getSelectedKPITarget = () => {
    const kpi = kpis.find(k => k.id.toString() === selectedKPI)
    return kpi?.goal || null // ใช้ goal แทน target
  }

  const getSelectedKPITargetType = () => {
    const kpi = kpis.find(k => k.id.toString() === selectedKPI)
    if (!kpi?.target) return 'number'
    
    const targetValue = parseFloat(kpi.target)
    if (isNaN(targetValue)) return 'number'
    
    // ถ้าค่าอยู่ระหว่าง 0-1 ให้ถือว่าเป็นเปอร์เซ็นต์
    return targetValue >= 0 && targetValue <= 1 ? 'percentage' : 'number'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          กลับ
        </Button>
        <h1 className="text-3xl font-bold">บันทึกผลลัพธ์ KPI ใหม่</h1>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="kpi">เลือก KPI *</Label>
                <Select value={selectedKPI} onValueChange={setSelectedKPI}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก KPI" />
                  </SelectTrigger>
                  <SelectContent>
                    {kpis.filter(kpi => kpi.status === 'approved').length > 0 ? (
                      kpis
                        .filter(kpi => kpi.status === 'approved')
                        .map(kpi => (
                          <SelectItem key={kpi.id} value={kpi.id.toString()}>
                            {kpi.title}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        ไม่มี KPI ที่อนุมัติแล้ว
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  แสดงเฉพาะ KPI ที่อนุมัติแล้ว ({kpis.filter(kpi => kpi.status === 'approved').length} รายการ)
                </p>
              </div>

              <div>
                <Label htmlFor="fiscalYear">ปีงบประมาณ *</Label>
                <Select value={fiscalYear.toString()} onValueChange={(value) => setFiscalYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        ปีงบประมาณ {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">รอบการรายงาน *</Label>
                <Select value={period} onValueChange={(value: '3' | '6' | '9' | '12') => setPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">รอบ 3 เดือน (ต.ค.-ธ.ค.)</SelectItem>
                    <SelectItem value="6">รอบ 6 เดือน (ต.ค.-มี.ค.)</SelectItem>
                    <SelectItem value="9">รอบ 9 เดือน (ต.ค.-มิ.ย.)</SelectItem>
                    <SelectItem value="12">รอบปีงบประมาณ (ต.ค.-ก.ย.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedKPI && kpis.filter(kpi => kpi.status === 'approved').length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">เป้าหมาย</Label>
                  <p className="text-sm text-muted-foreground">{getSelectedKPIGoal() || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">หน่วยวัด</Label>
                  <p className="text-sm text-muted-foreground">{getSelectedKPIMeasure() || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ค่าเป้าหมาย</Label>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const kpiTarget = getSelectedKPITarget()
                      const kpiTargetType = getSelectedKPITargetType()
                      
                      console.log('Display Debug - KPI Target:', {
                        kpiTarget,
                        kpiTargetType,
                        selectedKPI,
                        kpis: kpis.map(k => ({ id: k.id, title: k.title, goal: k.goal }))
                      })
                      
                      if (kpiTarget !== null) {
                        return kpiTargetType === 'percentage' 
                          ? `${(parseFloat(kpiTarget) * 100).toFixed(2)}%` 
                          : `${parseFloat(kpiTarget).toFixed(2)}`
                      }
                      return 'ไม่ระบุ'
                    })()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ตัวแปร A</Label>
                  <p className="text-sm text-muted-foreground">
                    {variableA || 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ตัวแปร B</Label>
                  <p className="text-sm text-muted-foreground">
                    {variableB || 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Selection */}
        <Card>
          <CardHeader>
            <CardTitle>แหล่งข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={dataSource} onValueChange={(value: 'manual' | 'query') => setDataSource(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <PenIcon className="w-4 h-4" />
                  กรอกเอง
                </TabsTrigger>
                <TabsTrigger value="query" className="flex items-center gap-2">
                  <DatabaseIcon className="w-4 h-4" />
                  Query ข้อมูล
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
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
                    
                    {/* แสดงข้อมูลจาก KPI */}
                    {(() => {
                      const kpiTarget = getSelectedKPITarget()
                      const kpiTargetType = getSelectedKPITargetType()
                      
                      console.log('Manual Mode Debug - KPI Target:', {
                        kpiTarget,
                        kpiTargetType,
                        targetValue,
                        targetValueType
                      })
                      
                      if (kpiTarget !== null) {
                        return (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-medium text-blue-800">ค่าเป้าหมายจาก KPI (เป้าหมาย):</p>
                            <p className="text-xs text-blue-700">
                              {kpiTargetType === 'percentage' 
                                ? `${(parseFloat(kpiTarget) * 100).toFixed(2)}%` 
                                : `${parseFloat(kpiTarget).toFixed(2)}`
                              }
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              สามารถแก้ไขได้ตามต้องการ
                            </p>
                          </div>
                        )
                      }
                      return (
                        <p className="text-xs text-muted-foreground">
                          {targetValueType === 'percentage' ? 'กรอกเป็น % (เช่น 90.0 = 90%)' : 'กรอกค่าเป้าหมาย'}
                        </p>
                      )
                    })()}
                  </div>
                </div>
                
                {/* ตัวแปร a, b */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variableA">ตัวแปร A</Label>
                    <Input
                      id="variableA"
                      type="number"
                      step="0.01"
                      placeholder="กรอกตัวแปร A"
                      value={variableA}
                      onChange={(e) => setVariableA(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">ตัวแปรสำหรับการคำนวณ</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variableB">ตัวแปร B</Label>
                    <Input
                      id="variableB"
                      type="number"
                      step="0.01"
                      placeholder="กรอกตัวแปร B"
                      value={variableB}
                      onChange={(e) => setVariableB(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">ตัวแปรสำหรับการคำนวณ</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="query" className="space-y-4">
                <div>
                  <Label htmlFor="queryTemplate">Template การ Query</Label>
                  <Select value={selectedTemplate} onValueChange={(value) => {
                    setSelectedTemplate(value)
                    const template = queryTemplates.find(t => t.id.toString() === value)
                    if (template) {
                      setQueryType(template.query_template)
                      // ตั้งค่า default dates สำหรับ query
                      const today = new Date()
                      const startDate = new Date(today.getFullYear(), today.getMonth(), 1) // วันที่ 1 ของเดือนปัจจุบัน
                      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // วันที่สุดท้ายของเดือนปัจจุบัน
                      
                      setQueryParams({
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0]
                      })
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก template" />
                    </SelectTrigger>
                    <SelectContent>
                      {queryTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* แสดงข้อมูล template ที่เลือก */}
                  {selectedTemplate && (() => {
                    const template = queryTemplates.find(t => t.id.toString() === selectedTemplate)
                    return template ? (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ประเภท: {template.query_type === 'hdc' ? 'HDC' : 
                                   template.query_type === 'mis' ? 'MIS' : 
                                   template.query_type === 'bangkan' ? 'Bangkan' : 
                                   template.query_type === 'custom' ? 'Custom' : template.query_type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Query: {template.query_template}
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>

                <div>
                  <Label htmlFor="queryParams">พารามิเตอร์เพิ่มเติม</Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="startDate" className="text-xs">วันที่เริ่มต้น</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={queryParams.start_date || ''}
                          onChange={(e) => setQueryParams(prev => ({ ...prev, start_date: e.target.value }))}
                          placeholder="YYYY-MM-DD"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-xs">วันที่สิ้นสุด</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={queryParams.end_date || ''}
                          onChange={(e) => setQueryParams(prev => ({ ...prev, end_date: e.target.value }))}
                          placeholder="YYYY-MM-DD"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      กรอกวันที่เริ่มต้นและสิ้นสุดสำหรับการ query ข้อมูล
                    </p>
                    
                    {/* แสดง parameters ที่จะส่ง */}
                    {(queryParams.start_date || queryParams.end_date) && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium text-blue-800">Parameters ที่จะส่ง:</p>
                        <p className="text-xs text-blue-700">
                          start_date: {queryParams.start_date || 'ไม่ระบุ'}, 
                          end_date: {queryParams.end_date || 'ไม่ระบุ'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Button 
                    type="button" 
                    onClick={executeQuery} 
                    disabled={isQuerying || !queryType || !dataSource}
                    className="w-full"
                  >
                    {isQuerying ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                        กำลัง Query...
                      </>
                    ) : (
                      <>
                        <DatabaseIcon className="w-4 h-4 mr-2" />
                        Execute Query
                      </>
                    )}
                  </Button>
                  
                  {/* แสดงข้อมูล query ที่จะส่ง */}
                  {selectedTemplate && (() => {
                    const template = queryTemplates.find(t => t.id.toString() === selectedTemplate)
                    return template ? (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs font-medium text-green-800">Query ที่จะส่ง:</p>
                        <p className="text-xs text-green-700">
                          dataSource: {template.query_type}, 
                          queryType: {template.query_template}
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>

                {/* แสดงค่าเป้าหมายจาก KPI ใน Query mode */}
                {(() => {
                  const kpiTarget = getSelectedKPITarget()
                  const kpiTargetType = getSelectedKPITargetType()
                  
                  if (kpiTarget !== null) {
                    return (
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <Label className="text-sm font-medium text-yellow-800">ค่าเป้าหมายจาก KPI (เป้าหมาย):</Label>
                        <p className="text-sm text-yellow-700 mt-1">
                          {kpiTargetType === 'percentage' 
                            ? `${(parseFloat(kpiTarget) * 100).toFixed(2)}%` 
                            : `${parseFloat(kpiTarget).toFixed(2)}`
                          }
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          ใช้เปรียบเทียบกับผลลัพธ์จาก Query
                        </p>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* ช่องกรอกค่าเป้าหมายใน Query Mode */}
                <div className="space-y-2">
                  <Label htmlFor="targetValueQuery">ค่าเป้าหมาย</Label>
                  <div className="flex gap-2">
                    <Input
                      id="targetValueQuery"
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
                  
                  {/* แสดงข้อมูลจาก KPI */}
                  {(() => {
                    const kpiTarget = getSelectedKPITarget()
                    const kpiTargetType = getSelectedKPITargetType()
                    
                    if (kpiTarget !== null) {
                      return (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-blue-800">ค่าเป้าหมายจาก KPI (เป้าหมาย):</p>
                          <p className="text-xs text-blue-700">
                            {kpiTargetType === 'percentage' 
                              ? `${(parseFloat(kpiTarget) * 100).toFixed(2)}%` 
                              : `${parseFloat(kpiTarget).toFixed(2)}`
                            }
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            สามารถแก้ไขได้ตามต้องการ
                          </p>
                        </div>
                      )
                    }
                    return (
                      <p className="text-xs text-muted-foreground">
                        {targetValueType === 'percentage' ? 'กรอกเป็น % (เช่น 90.0 = 90%)' : 'กรอกค่าเป้าหมาย'}
                      </p>
                    )
                  })()}
                </div>

                <div>
                  <Label htmlFor="queryResult">ผลลัพธ์จาก Query</Label>
                  <Input
                    id="queryResult"
                    type="number"
                    step="0.01"
                    placeholder="ผลลัพธ์จะแสดงที่นี่หลังจาก Execute Query"
                    value={queryResult}
                    onChange={(e) => setQueryResult(e.target.value)}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    คลิกปุ่ม Execute Query เพื่อดึงข้อมูลจากระบบภายนอก
                  </p>
                </div>
                
                {/* ตัวแปร a, b สำหรับ Query Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variableAQuery">ตัวแปร A</Label>
                    <Input
                      id="variableAQuery"
                      type="number"
                      step="0.01"
                      placeholder="กรอกตัวแปร A"
                      value={variableA}
                      onChange={(e) => setVariableA(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">ตัวแปรสำหรับการคำนวณ</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variableBQuery">ตัวแปร B</Label>
                    <Input
                      id="variableBQuery"
                      type="number"
                      step="0.01"
                      placeholder="กรอกตัวแปร B"
                      value={variableB}
                      onChange={(e) => setVariableB(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">ตัวแปรสำหรับการคำนวณ</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Note */}
        <Card>
          <CardHeader>
            <CardTitle>หมายเหตุ</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="ระบุหมายเหตุหรือคำอธิบายเพิ่มเติม"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !selectedKPI || kpis.filter(kpi => kpi.status === 'approved').length === 0}
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            {loading ? "กำลังบันทึก..." : "บันทึกผลลัพธ์"}
          </Button>
        </div>
        
        {/* Warning if no approved KPIs */}
        {kpis.filter(kpi => kpi.status === 'approved').length === 0 && (
          <Alert className="mt-4">
            <AlertDescription>
              ไม่มี KPI ที่อนุมัติแล้ว กรุณารอการอนุมัติ KPI จากผู้ดูแลระบบก่อนบันทึกผลลัพธ์
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
