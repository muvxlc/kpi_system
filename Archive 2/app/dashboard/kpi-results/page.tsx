"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, PlusIcon, SearchIcon, EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon, SendIcon, RotateCcwIcon } from "lucide-react"
import { getRecentFiscalYears } from "@/lib/fiscal-year-utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface KPIResult {
  id: number
  kpi_id: number
  kpi_title: string
  fiscal_year: number
  period: '3' | '6' | '9' | '12'
  period_start: string
  period_end: string
  actual_value: number
  target_value: number
  achievement_percentage: number
  data_source: 'manual' | 'query'
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_by_name: string
  created_at: string
}

export default function KPIResultsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [results, setResults] = useState<KPIResult[]>([])
  const [loading, setLoading] = useState(true)
  const [fiscalYear, setFiscalYear] = useState<number>(getRecentFiscalYears()[0])
  const [period, setPeriod] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fiscalYears = getRecentFiscalYears()

  useEffect(() => {
    fetchResults()
  }, [fiscalYear, period])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (fiscalYear) params.append("fiscalYear", fiscalYear.toString())
      if (period && period !== "all") params.append("period", period)

      const response = await fetch(`/api/kpi-results?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      submitted: "secondary",
      approved: "default",
      rejected: "destructive"
    }

    const labels: Record<string, string> = {
      draft: "ร่าง",
      submitted: "ส่งแล้ว",
      approved: "อนุมัติแล้ว",
      rejected: "ไม่อนุมัติ"
    }

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  const getDataSourceBadge = (source: string) => {
    return (
      <Badge variant={source === 'manual' ? 'default' : 'secondary'}>
        {source === 'manual' ? 'กรอกเอง' : 'Query'}
      </Badge>
    )
  }

  const getPeriodName = (period: string) => {
    const periodMap: Record<string, string> = {
      '3months': 'รอบ 3 เดือน (ต.ค.-ธ.ค.)',
      '6months': 'รอบ 6 เดือน (ต.ค.-มี.ค.)',
      '9months': 'รอบ 9 เดือน (ต.ค.-มิ.ย.)',
      'yearly': 'รอบปีงบประมาณ (ต.ค.-ก.ย.)'
    }
    return periodMap[period] || period
  }

  const filteredResults = results.filter(result =>
    result.kpi_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.created_by_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (id: number) => {
    router.push(`/dashboard/kpi-results/${id}/edit`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผลลัพธ์ KPI นี้?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/kpi-results/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // ลบออกจาก state และ refresh
        setResults(results.filter(result => result.id !== id))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'เกิดข้อผิดพลาดในการลบข้อมูล')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('เกิดข้อผิดพลาดในการลบข้อมูล')
    } finally {
      setDeletingId(null)
    }
  }

  const canEdit = (result: KPIResult) => {
    return ['admin', 'manager', 'staff'].includes(user?.role || '') || result.created_by_name === user?.name
  }

  const canDelete = (result: KPIResult) => {
    return ['admin', 'manager', 'staff'].includes(user?.role || '') || result.created_by_name === user?.name
  }

  const canApprove = (result: KPIResult) => {
    return (user?.role === 'admin' || user?.role === 'approver' || user?.role === 'manager') && 
           (result.status === 'submitted' || result.status === 'draft')
  }

  const canReject = (result: KPIResult) => {
    return (user?.role === 'admin' || user?.role === 'approver' || user?.role === 'manager') && 
           (result.status === 'submitted' || result.status === 'draft')
  }

  const canUnapprove = (result: KPIResult) => {
    return user?.role === 'admin' && result.status === 'approved'
  }

  const canSubmit = (result: KPIResult) => {
    return (['admin', 'manager', 'staff'].includes(user?.role || '') || result.created_by_name === user?.name) && 
           result.status === 'draft'
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/kpi-results/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // อัปเดตสถานะใน state
        setResults(results.map(result => 
          result.id === id 
            ? { ...result, status: newStatus as any }
            : result
        ))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
      }
    } catch (error) {
      console.error('Status change error:', error)
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    }
  }

  const handleUnapprove = async (id: number) => {
    if (!confirm('คุณต้องการยกเลิกอนุมัติรายการนี้หรือไม่?')) {
      return
    }

    try {
      const response = await fetch(`/api/kpi-results/${id}/unapprove`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // อัปเดตสถานะใน state
        setResults(results.map(result => 
          result.id === id 
            ? { ...result, status: 'draft' as any }
            : result
        ))
        alert(data.message || 'ยกเลิกอนุมัติสำเร็จ')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'เกิดข้อผิดพลาดในการยกเลิกอนุมัติ')
      }
    } catch (error) {
      console.error('Unapprove error:', error)
      alert('เกิดข้อผิดพลาดในการยกเลิกอนุมัติ')
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ผลลัพธ์ KPI</h1>
        <Button onClick={() => window.location.href = '/dashboard/kpi-results/create'}>
          <PlusIcon className="w-4 h-4 mr-2" />
          บันทึกผลลัพธ์ใหม่
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="fiscalYear">ปีงบประมาณ</Label>
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
                <Label htmlFor="period">รอบการรายงาน</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกรอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="3">รอบ 3 เดือน</SelectItem>
                    <SelectItem value="6">รอบ 6 เดือน</SelectItem>
                    <SelectItem value="9">รอบ 9 เดือน</SelectItem>
                    <SelectItem value="12">รอบปีงบประมาณ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div>
              <Label htmlFor="search">ค้นหา</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ค้นหา KPI หรือผู้บันทึก..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchResults} className="w-full">
                ค้นหา
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการผลลัพธ์ KPI</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบผลลัพธ์ KPI
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">KPI</th>
                    <th className="text-left p-2">ปีงบประมาณ</th>
                    <th className="text-left p-2">รอบ</th>
                    <th className="text-left p-2">ช่วงเวลา</th>
                    <th className="text-left p-2">ค่าจริง</th>
                    <th className="text-left p-2">เป้าหมาย</th>
                    <th className="text-left p-2">% ความสำเร็จ</th>
                    <th className="text-left p-2">แหล่งข้อมูล</th>
                    <th className="text-left p-2">สถานะ</th>
                    <th className="text-left p-2">ผู้บันทึก</th>
                    <th className="text-left p-2">วันที่</th>
                    <th className="text-left p-2">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{result.kpi_title}</td>
                      <td className="p-2">ปีงบประมาณ {result.fiscal_year}</td>
                      <td className="p-2">{getPeriodName(result.period)}</td>
                      <td className="p-2 text-sm">
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
                      </td>
                                             <td className="p-2">
                         {result.actual_value ? (
                           result.actual_value < 1 && result.actual_value > 0 ? 
                             `${(result.actual_value * 100).toFixed(2)}%` : 
                             Number(result.actual_value).toFixed(2)
                         ) : '-'}
                       </td>
                       <td className="p-2">
                         {result.target_value ? (
                           result.target_value < 1 && result.target_value > 0 ? 
                             `${(result.target_value * 100).toFixed(2)}%` : 
                             Number(result.target_value).toFixed(2)
                         ) : '-'}
                       </td>
                      <td className="p-2">
                        {result.achievement_percentage ? `${result.achievement_percentage}%` : '-'}
                      </td>
                      <td className="p-2">{getDataSourceBadge(result.data_source)}</td>
                      <td className="p-2">{getStatusBadge(result.status)}</td>
                      <td className="p-2">{result.created_by_name}</td>
                      <td className="p-2 text-sm">
                        {new Date(result.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 flex-wrap">
                          {/* ปุ่มแก้ไข */}
                          {canEdit(result) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(result.id)}
                              className="h-8 px-2"
                              title="แก้ไข"
                            >
                              <EditIcon className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {/* ปุ่มส่ง (เฉพาะร่าง) */}
                          {canSubmit(result) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(result.id, 'submitted')}
                              className="h-8 px-2 text-blue-600 hover:text-blue-700"
                              title="ส่งเพื่ออนุมัติ"
                            >
                              <SendIcon className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {/* ปุ่มอนุมัติ (เฉพาะ admin/approver) */}
                          {canApprove(result) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(result.id, 'approved')}
                              className="h-8 px-2 text-green-600 hover:text-green-700"
                              title="อนุมัติ"
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {/* ปุ่มไม่อนุมัติ (เฉพาะ admin/approver) */}
                          {canReject(result) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(result.id, 'rejected')}
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                              title="ไม่อนุมัติ"
                            >
                              <XCircleIcon className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {/* ปุ่มยกเลิกอนุมัติ (เฉพาะ admin) */}
                          {canUnapprove(result) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnapprove(result.id)}
                              className="h-8 px-2 text-orange-600 hover:text-orange-700"
                              title="ยกเลิกอนุมัติ"
                            >
                              <RotateCcwIcon className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {/* ปุ่มลบ */}
                          {canDelete(result) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(result.id)}
                              disabled={deletingId === result.id}
                              className="h-8 px-2 text-destructive hover:text-destructive"
                              title="ลบ"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
