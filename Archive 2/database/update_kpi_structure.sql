-- อัปเดตโครงสร้างตาราง kpis เพื่อรองรับ kpi_type
-- เพิ่ม field kpi_type และอัปเดตข้อมูลที่มีอยู่

-- เพิ่ม column kpi_type
ALTER TABLE kpis ADD COLUMN kpi_type ENUM('hospital', 'hdc') NOT NULL DEFAULT 'hospital' AFTER id;

-- อัปเดตข้อมูลที่มีอยู่ (ตัวอย่าง - ปรับตามข้อมูลจริง)
-- KPI ที่เกี่ยวกับโรงพยาบาล
UPDATE kpis SET kpi_type = 'hospital' WHERE title LIKE '%โรงพยาบาล%' OR title LIKE '%ผู้ป่วย%' OR title LIKE '%การรักษา%';

-- KPI ที่เกี่ยวกับ HDC
UPDATE kpis SET kpi_type = 'hdc' WHERE title LIKE '%HDC%' OR title LIKE '%กระทรวง%' OR title LIKE '%สาธารณสุข%';

-- สร้าง index สำหรับการค้นหา
CREATE INDEX idx_kpis_kpi_type ON kpis(kpi_type);

-- แสดงผลลัพธ์
SELECT kpi_type, COUNT(*) as count FROM kpis GROUP BY kpi_type;
