"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Database, Globe, FileText } from "lucide-react"

export default function QueryTemplatesGuidePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">คู่มือการใช้งาน Query Templates</h1>
        <p className="text-muted-foreground mt-2">
          เรียนรู้วิธีการสร้างและใช้งาน Query Templates สำหรับดึงข้อมูลจากแหล่งต่างๆ
        </p>
      </div>

      <Tabs defaultValue="hdc" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hdc" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            HDC
          </TabsTrigger>
          <TabsTrigger value="mis" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            MIS
          </TabsTrigger>
          <TabsTrigger value="bangkan" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Bangkan
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* HDC Tab */}
        <TabsContent value="hdc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                HDC (Health Data Center)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ระบบฐานข้อมูลกลางด้านสุขภาพของกระทรวงสาธารณสุข
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">maternal_mortality</h4>
                  <p className="text-sm text-muted-foreground">อัตราส่วนการตายมารดา</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: จำนวนต่อแสนคน
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">child_development</h4>
                  <p className="text-sm text-muted-foreground">พัฒนาการเด็ก</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: ร้อยละ (80-100%)
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">customer_satisfaction</h4>
                  <p className="text-sm text-muted-foreground">ความพึงพอใจลูกค้า</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: คะแนน (3.0-5.0)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MIS Tab */}
        <TabsContent value="mis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                MIS (Management Information System)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ระบบสารสนเทศเพื่อการจัดการ
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">operating_expenses</h4>
                  <p className="text-sm text-muted-foreground">ค่าใช้จ่ายในการดำเนินงาน</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: บาท
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">service_time</h4>
                  <p className="text-sm text-muted-foreground">เวลาในการให้บริการ</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: นาที
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">training_completion</h4>
                  <p className="text-sm text-muted-foreground">การอบรมพนักงาน</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: ร้อยละ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bangkan Tab */}
        <TabsContent value="bangkan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Bangkan Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ฐานข้อมูลของเทศบาลเมืองบางขัน
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">population_count</h4>
                  <p className="text-sm text-muted-foreground">นับจำนวนประชากร</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: unit</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: จำนวนคน
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">revenue_summary</h4>
                  <p className="text-sm text-muted-foreground">สรุปรายได้</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: บาท
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">service_count</h4>
                  <p className="text-sm text-muted-foreground">นับจำนวนการให้บริการ</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: start_date, end_date</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: จำนวนครั้ง
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">custom_sql</h4>
                  <p className="text-sm text-muted-foreground">Custom SQL Query</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: sql, parameters</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: ตาม SQL ที่กำหนด
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Custom Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                สำหรับการ query แบบพิเศษหรือเชื่อมต่อกับระบบภายนอก
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">sql</h4>
                  <p className="text-sm text-muted-foreground">Custom SQL Query</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: query, parameters</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: ตาม SQL ที่กำหนด
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold">api</h4>
                  <p className="text-sm text-muted-foreground">External API Call</p>
                  <div className="mt-2">
                    <Badge variant="outline">Parameters: endpoint, params</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ผลลัพธ์: ตาม API ที่กำหนด
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ตัวอย่างการใช้งาน */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวอย่างการสร้าง Query Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">ตัวอย่างที่ 1: HDC Query</h4>
            <div className="space-y-2 text-sm">
              <p><strong>KPI:</strong> อัตราส่วนการตายมารดา</p>
              <p><strong>ชื่อ Template:</strong> Query อัตราส่วนการตายมารดา</p>
              <p><strong>คำอธิบาย:</strong> ดึงข้อมูลจากระบบ HDC</p>
              <p><strong>ประเภท Query:</strong> HDC</p>
              <p><strong>Query Template:</strong> maternal_mortality</p>
              <p><strong>พารามิเตอร์:</strong> start_date, end_date</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">ตัวอย่างที่ 2: Bangkan Database</h4>
            <div className="space-y-2 text-sm">
              <p><strong>KPI:</strong> จำนวนประชากร</p>
              <p><strong>ชื่อ Template:</strong> Query จำนวนประชากร</p>
              <p><strong>คำอธิบาย:</strong> ดึงข้อมูลจากฐานข้อมูล Bangkan</p>
              <p><strong>ประเภท Query:</strong> Bangkan</p>
              <p><strong>Query Template:</strong> population_count</p>
              <p><strong>พารามิเตอร์:</strong> unit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
