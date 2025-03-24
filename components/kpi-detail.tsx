"use client"

import { format } from "date-fns"
import { th } from "date-fns/locale"

interface KpiDetailProps {
  kpi: any
}

export function KpiDetail({ kpi }: KpiDetailProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">หัวข้อ</h3>
          <p className="text-base">{kpi.title}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">หัวข้อภาษาอังกฤษ</h3>
          <p className="text-base">{kpi.titleEn || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">กลุ่ม KPI</h3>
          <p className="text-base">{kpi.group}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">แผนก</h3>
          <p className="text-base">{kpi.dept_name}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">แผน</h3>
          <p className="text-base">{kpi.plan || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">โครงการ</h3>
          <p className="text-base">{kpi.project || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">เจ้าของหลัก</h3>
          <p className="text-base">{kpi.owner1_name}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">เจ้าของร่วม</h3>
          <p className="text-base">{kpi.owner2_name || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">วันที่เริ่มต้น</h3>
          <p className="text-base">{kpi.date_start ? format(new Date(kpi.date_start), "PPP", { locale: th }) : "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">สถานะ</h3>
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              kpi.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {kpi.status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">รายละเอียด</h3>
        <p className="text-base whitespace-pre-line">{kpi.detail || "-"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">วัตถุประสงค์</h3>
          <p className="text-base">{kpi.objective || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">ฟังก์ชัน</h3>
          <p className="text-base">{kpi.xfunction || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">ตัวแปร A</h3>
          <p className="text-base">{kpi.var_a || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">ตัวแปร B</h3>
          <p className="text-base">{kpi.var_b || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">รหัส ICD</h3>
          <p className="text-base">{kpi.icd_code || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">รอบ</h3>
          <p className="text-base">{kpi.round || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">การวัดผล</h3>
          <p className="text-base">{kpi.measure || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">เป้าหมาย</h3>
          <p className="text-base">{kpi.goal || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">การแจ้งเตือน</h3>
          <p className="text-base">{kpi.alert || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">เกณฑ์เปรียบเทียบ</h3>
          <p className="text-base">{kpi.benchmark || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">วิธีการ</h3>
          <p className="text-base">{kpi.method || "-"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">อ้างอิง</h3>
          <p className="text-base">{kpi.ref || "-"}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">หมายเหตุ</h3>
        <p className="text-base whitespace-pre-line">{kpi.note || "-"}</p>
      </div>
    </div>
  )
}

