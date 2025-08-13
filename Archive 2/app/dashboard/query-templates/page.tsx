"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface QueryTemplate {
  id: number
  kpi_id: number
  kpi_title: string
  name: string
  description: string
  query_type: 'hdc' | 'mis' | 'bangkan' | 'custom'
  query_template: string
  parameters: string[]
  created_by_name: string
  created_at: string
}

interface KPI {
  id: number
  title: string
}

export default function QueryTemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<QueryTemplate[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<QueryTemplate | null>(null)
  const [error, setError] = useState<string>("")
  
  // Form fields
  const [kpiId, setKpiId] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [queryType, setQueryType] = useState<string>("")
  const [queryTemplate, setQueryTemplate] = useState<string>("")
  const [parameters, setParameters] = useState<string>("")

  useEffect(() => {
    fetchTemplates()
    fetchKPIs()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError("")
      console.log('Fetching templates...')
      const response = await fetch('/api/kpi-query-templates')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Templates data:', data)
        setTemplates(data.templates || [])
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setError(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setError(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchKPIs = async () => {
    try {
      console.log('Fetching KPIs...')
      const response = await fetch('/api/kpi')
      console.log('KPIs response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('KPIs data:', data)
        setKpis(data.kpis || [])
      } else {
        console.error('KPIs API error:', response.status)
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    }
  }

  const resetForm = () => {
    setKpiId("")
    setName("")
    setDescription("")
    setQueryType("")
    setQueryTemplate("")
    setParameters("")
    setEditingTemplate(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const templateData = {
        kpi_id: parseInt(kpiId),
        name,
        description,
        query_type: queryType,
        query_template: queryTemplate,
        parameters: parameters.split(',').map(p => p.trim()).filter(p => p)
      }

      const url = editingTemplate 
        ? `/api/kpi-query-templates/${editingTemplate.id}`
        : '/api/kpi-query-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        alert(editingTemplate ? 'อัปเดต template สำเร็จ' : 'สร้าง template สำเร็จ')
        setIsDialogOpen(false)
        resetForm()
        fetchTemplates()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
  }

  const handleEdit = (template: QueryTemplate) => {
    setEditingTemplate(template)
    setKpiId(template.kpi_id.toString())
    setName(template.name)
    setDescription(template.description)
    setQueryType(template.query_type)
    setQueryTemplate(template.query_template)
    
    // แปลง parameters จาก JSON string หรือ array เป็น string
    let paramsStr = ""
    if (typeof template.parameters === 'string') {
      try {
        const parsed = JSON.parse(template.parameters)
        paramsStr = Array.isArray(parsed) ? parsed.join(', ') : parsed
      } catch {
        paramsStr = template.parameters
      }
    } else if (Array.isArray(template.parameters)) {
      paramsStr = template.parameters.join(', ')
    }
    setParameters(paramsStr)
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ template นี้?')) {
      return
    }

    try {
      const response = await fetch(`/api/kpi-query-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('ลบ template สำเร็จ')
        fetchTemplates()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'เกิดข้อผิดพลาดในการลบ')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
  }

  const getQueryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'hdc': 'HDC',
      'mis': 'MIS',
      'bangkan': 'Bangkan',
      'custom': 'Custom'
    }
    return labels[type] || type
  }

  const getQueryTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      'hdc': 'default',
      'mis': 'secondary',
      'bangkan': 'outline',
      'custom': 'outline'
    }

    return (
      <Badge variant={variants[type] || "outline"}>
        {getQueryTypeLabel(type)}
      </Badge>
    )
  }

  if (!['admin', 'manager'].includes(user?.role || '')) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground mt-2">
            เฉพาะ admin และ manager เท่านั้นที่สามารถเข้าถึงหน้านี้ได้
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการ Query Templates</h1>
          <p className="text-muted-foreground mt-1">
            สร้างและจัดการ templates สำหรับดึงข้อมูลจากแหล่งต่างๆ
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/dashboard/query-templates/guide">
              📖 คู่มือการใช้งาน
            </a>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}>
                <PlusIcon className="w-4 h-4 mr-2" />
                สร้าง Template ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'แก้ไข Template' : 'สร้าง Template ใหม่'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kpi">เลือก KPI *</Label>
                    <Select value={kpiId} onValueChange={setKpiId}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก KPI" />
                      </SelectTrigger>
                      <SelectContent>
                        {kpis.map(kpi => (
                          <SelectItem key={kpi.id} value={kpi.id.toString()}>
                            {kpi.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">ชื่อ Template *</Label>
                    <Input
                      id="name"
                      placeholder="ชื่อ template"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea
                    id="description"
                    placeholder="คำอธิบาย template"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="queryType">ประเภท Query *</Label>
                    <Select value={queryType} onValueChange={setQueryType}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hdc">HDC (Health Data Center)</SelectItem>
                        <SelectItem value="mis">MIS (Management Information System)</SelectItem>
                        <SelectItem value="bangkan">Bangkan Database</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="queryTemplate">Query Template *</Label>
                    <Input
                      id="queryTemplate"
                      placeholder="ชื่อ query หรือ SQL"
                      value={queryTemplate}
                      onChange={(e) => setQueryTemplate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      สำหรับ HDC: maternal_mortality, child_development, customer_satisfaction<br/>
                      สำหรับ MIS: operating_expenses, service_time, training_completion<br/>
                      สำหรับ Bangkan: population_count, revenue_summary, service_count, custom_sql<br/>
                      สำหรับ Custom: sql, api
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="parameters">พารามิเตอร์ (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                  <Input
                    id="parameters"
                    placeholder="เช่น start_date, end_date, unit"
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>HDC:</strong> start_date, end_date<br/>
                    <strong>MIS:</strong> start_date, end_date<br/>
                    <strong>Bangkan:</strong> start_date, end_date, unit (สำหรับ custom_sql: sql, parameters)<br/>
                    <strong>Custom:</strong> query, parameters (สำหรับ sql) หรือ endpoint, params (สำหรับ api)
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">
                    {editingTemplate ? 'อัปเดต' : 'สร้าง'} Template
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <p className="font-medium">เกิดข้อผิดพลาด:</p>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการ Query Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบ Query Templates
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        {getQueryTypeBadge(template.query_type)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">KPI:</span> {template.kpi_title}
                        </div>
                        <div>
                          <span className="font-medium">Template:</span> {template.query_template}
                        </div>
                        <div>
                          <span className="font-medium">พารามิเตอร์:</span> {
                            (() => {
                              if (typeof template.parameters === 'string') {
                                try {
                                  const parsed = JSON.parse(template.parameters)
                                  return Array.isArray(parsed) ? parsed.join(', ') : parsed
                                } catch {
                                  return template.parameters
                                }
                              } else if (Array.isArray(template.parameters)) {
                                return template.parameters.join(', ')
                              }
                              return 'ไม่มี'
                            })()
                          }
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        สร้างโดย: {template.created_by_name} | {new Date(template.created_at).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
