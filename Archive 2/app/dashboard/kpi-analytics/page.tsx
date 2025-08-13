"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react"
import { getRecentFiscalYears } from "@/lib/fiscal-year-utils"
import { useAuth } from "@/lib/auth-context"
import { Chart, BarChart, LineChart, PieChart } from "@/components/ui/chart"

interface KPIAnalytics {
  kpi_id: number
  kpi_title: string
  target_value: number
  actual_values: {
    period: string
    value: number
    target_value: number
    achievement_percentage: number
    date: string
  }[]
  achievement_percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  status: 'on_track' | 'at_risk' | 'off_track'
}

interface DashboardStats {
  total_kpis: number
  on_track: number
  at_risk: number
  off_track: number
  average_achievement: number
  total_results: number
}

export default function KPIAnalyticsPage() {
  const { user } = useAuth()
  const [selectedKPI, setSelectedKPI] = useState<string>("all")
  const [fiscalYear, setFiscalYear] = useState<number>(getRecentFiscalYears()[0])
  const [period, setPeriod] = useState<string>("all")
  const [analytics, setAnalytics] = useState<KPIAnalytics[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview')
  const [kpiOptions, setKpiOptions] = useState<{ id: string; title: string }[]>([])

  const fiscalYears = getRecentFiscalYears()

  useEffect(() => {
    fetchAnalytics()
  }, [fiscalYear, period, selectedKPI])

  useEffect(() => {
    fetchKpiOptions()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (fiscalYear) params.append("fiscalYear", fiscalYear.toString())
      if (period && period !== "all") params.append("period", period)
      if (selectedKPI && selectedKPI !== "all") params.append("kpiId", selectedKPI)

      const response = await fetch(`/api/kpi-analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKpiOptions = async () => {
    try {
      const response = await fetch('/api/kpi')
      if (response.ok) {
        const data = await response.json()
        setKpiOptions(data.kpis?.map((kpi: any) => ({
          id: kpi.id.toString(),
          title: kpi.title
        })) || [])
      }
    } catch (error) {
      console.error("Error fetching KPI options:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800'
      case 'off_track': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_track': return 'ตามเป้าหมาย'
      case 'at_risk': return 'มีความเสี่ยง'
      case 'off_track': return 'ไม่ตามเป้าหมาย'
      default: return 'ไม่ระบุ'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard KPI Analytics</h1>
          <p className="text-muted-foreground mt-2">
            วิเคราะห์และติดตามผลการดำเนินงานตาม KPI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            onClick={() => setViewMode('overview')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            ภาพรวม
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            onClick={() => setViewMode('detailed')}
            className="flex items-center gap-2"
          >
            <LineChartIcon className="w-4 h-4" />
            รายละเอียด
          </Button>
          <Button
            variant={viewMode === 'comparison' ? 'default' : 'outline'}
            onClick={() => setViewMode('comparison')}
            className="flex items-center gap-2"
          >
            <BarChartIcon className="w-4 h-4" />
            เปรียบเทียบ
          </Button>
        </div>
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
              <Label htmlFor="kpi">เลือก KPI</Label>
              <Select value={selectedKPI} onValueChange={setSelectedKPI}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือก KPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {kpiOptions.map((kpi) => (
                    <SelectItem key={kpi.id} value={kpi.id}>
                      {kpi.title.length > 30 ? kpi.title.substring(0, 30) + '...' : kpi.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchAnalytics} className="w-full">
                อัปเดต
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <>
          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KPI ทั้งหมด</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_kpis}</div>
                  <p className="text-xs text-muted-foreground">
                    รายการ KPI ทั้งหมด
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ตามเป้าหมาย</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.on_track}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_kpis > 0 ? `${((stats.on_track / stats.total_kpis) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">มีความเสี่ยง</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.at_risk}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_kpis > 0 ? `${((stats.at_risk / stats.total_kpis) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ไม่ตามเป้าหมาย</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.off_track}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_kpis > 0 ? `${((stats.off_track / stats.total_kpis) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pie Chart สำหรับสถานะ KPI */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>สถานะ KPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <PieChart
                    data={[
                      { label: 'ตามเป้าหมาย', value: stats.on_track, color: '#10b981' },
                      { label: 'มีความเสี่ยง', value: stats.at_risk, color: '#f59e0b' },
                      { label: 'ไม่ตามเป้าหมาย', value: stats.off_track, color: '#ef4444' }
                    ]}
                    size={200}
                    showLabels={true}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Performance Grid */}
          <Card>
            <CardHeader>
              <CardTitle>ผลการดำเนินงาน KPI</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics && analytics.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.map((kpi) => (
                      <Card key={kpi.kpi_id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium line-clamp-2">
                              {kpi.kpi_title}
                            </CardTitle>
                            {getTrendIcon(kpi.trend)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">เป้าหมาย:</span>
                            <span className="text-sm font-medium">
                              {kpi.actual_values.length > 0 ? 
                                (kpi.actual_values[0].target_value < 1 ? 
                                  (kpi.actual_values[0].target_value * 100).toFixed(2) + '%' :
                                  kpi.actual_values[0].target_value
                                ) : kpi.target_value
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">ความสำเร็จ:</span>
                            <span className="text-sm font-medium">
                              {kpi.actual_values.length > 0 ? 
                                kpi.actual_values[0].achievement_percentage.toFixed(1) : 
                                kpi.achievement_percentage.toFixed(1)
                              }%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">สถานะ:</span>
                            <Badge className={getStatusColor(kpi.status)}>
                              {getStatusLabel(kpi.status)}
                            </Badge>
                          </div>

                          {/* Mini Chart */}
                          {kpi.actual_values && kpi.actual_values.length > 0 && (
                            <div className="h-16">
                              <BarChart
                                data={kpi.actual_values.slice(-3).map((value, index) => ({
                                  label: value.period,
                                  value: value.value,
                                  color: index === kpi.actual_values.length - 1 ? '#10b981' : '#3b82f6'
                                }))}
                                height={64}
                                showValues={false}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  ไม่มีข้อมูล
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียด KPI</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics && analytics.length > 0 ? (
              <div className="space-y-4">
                {analytics.map((kpi, index) => (
                  <Card key={kpi.kpi_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {index + 1}. {kpi.kpi_title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {kpi.actual_values.length > 0 ? 
                              (kpi.actual_values[0].target_value < 1 ? 
                                (kpi.actual_values[0].target_value * 100).toFixed(2) + '%' :
                                kpi.actual_values[0].target_value
                              ) : 'ไม่ระบุ'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">เป้าหมาย</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {kpi.actual_values.length > 0 ? 
                              kpi.actual_values[0].achievement_percentage.toFixed(1) : 
                              kpi.achievement_percentage.toFixed(1)
                            }%
                          </div>
                          <div className="text-sm text-muted-foreground">ความสำเร็จ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {kpi.actual_values.length}
                          </div>
                          <div className="text-sm text-muted-foreground">จำนวนข้อมูล</div>
                        </div>
                      </div>

                      {/* Trend Chart */}
                      {kpi.actual_values && kpi.actual_values.length > 1 && (
                        <div className="h-32">
                          <LineChart
                            data={kpi.actual_values
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .map((value) => ({
                                label: value.period,
                                value: value.value
                              }))}
                            height={128}
                            showGrid={true}
                          />
                        </div>
                      )}

                      {/* Performance Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">รอบ</th>
                              <th className="text-left p-2">ค่าจริง</th>
                              <th className="text-left p-2">เป้าหมาย</th>
                              <th className="text-left p-2">% ความสำเร็จ</th>
                              <th className="text-left p-2">วันที่</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kpi.actual_values && kpi.actual_values.map((value, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">{value.period}</td>
                                <td className="p-2">
                                  {value.value < 1 ? 
                                    (value.value * 100).toFixed(2) + '%' :
                                    value.value
                                  }
                                </td>
                                <td className="p-2">
                                  {value.target_value ? 
                                    (value.target_value < 1 ? 
                                      (value.target_value * 100).toFixed(2) + '%' :
                                      value.target_value
                                    ) : 'ไม่ระบุ'
                                  }
                                </td>
                                <td className="p-2">
                                  {value.achievement_percentage ? 
                                    value.achievement_percentage.toFixed(1) : 'N/A'}%
                                </td>
                                <td className="p-2">{value.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                ไม่มีข้อมูล
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Mode */}
      {viewMode === 'comparison' && (
        <Card>
          <CardHeader>
            <CardTitle>เปรียบเทียบ KPI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Achievement Comparison Chart */}
              {analytics && analytics.length > 0 ? (
                <Chart title="เปรียบเทียบ % ความสำเร็จของ KPI">
                  <BarChart
                    data={analytics.slice(0, 10).map((kpi) => ({
                      label: kpi.kpi_title.length > 20 ? kpi.kpi_title.substring(0, 20) + '...' : kpi.kpi_title,
                      value: Math.round(kpi.achievement_percentage),
                      color: kpi.status === 'on_track' ? '#10b981' : 
                             kpi.status === 'at_risk' ? '#f59e0b' : '#ef4444'
                    }))}
                    height={200}
                    showValues={true}
                  />
                </Chart>
              ) : (
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">ไม่มีข้อมูล</span>
                </div>
              )}

              {/* Performance Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics && analytics.length > 0 ? (
                        analytics
                          .sort((a, b) => b.achievement_percentage - a.achievement_percentage)
                          .slice(0, 5)
                          .map((kpi) => (
                            <div key={kpi.kpi_id} className="flex items-center justify-between">
                              <span className="text-sm truncate flex-1">{kpi.kpi_title}</span>
                              <Badge variant="outline" className="ml-2">
                                {kpi.achievement_percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          ไม่มีข้อมูล
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Need Attention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics && analytics.length > 0 ? (
                        analytics
                          .sort((a, b) => a.achievement_percentage - b.achievement_percentage)
                          .slice(0, 5)
                          .map((kpi) => (
                            <div key={kpi.kpi_id} className="flex items-center justify-between">
                              <span className="text-sm truncate flex-1">{kpi.kpi_title}</span>
                              <Badge variant="destructive" className="ml-2">
                                {kpi.achievement_percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          ไม่มีข้อมูล
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}