-- ตรวจสอบและแก้ไขโครงสร้างตาราง kpis
-- รันคำสั่งนี้ใน MySQL เพื่อตรวจสอบและแก้ไขปัญหา

-- 1. ตรวจสอบโครงสร้างตารางปัจจุบัน
DESCRIBE kpis;

-- 2. ตรวจสอบว่ามี column kpi_type หรือไม่
SHOW COLUMNS FROM kpis LIKE 'kpi_type';

-- 3. ถ้าไม่มี column kpi_type ให้เพิ่ม
-- (รันคำสั่งนี้เฉพาะเมื่อไม่มี column kpi_type)
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS kpi_type ENUM('hospital', 'hdc') NOT NULL DEFAULT 'hospital' AFTER id;

-- 4. ตรวจสอบข้อมูลที่มีอยู่
SELECT COUNT(*) as total_kpis FROM kpis;

-- 5. อัปเดตข้อมูลที่มีอยู่ให้มี kpi_type
UPDATE kpis SET kpi_type = 'hospital' WHERE kpi_type IS NULL OR kpi_type = '';

-- 6. ตรวจสอบผลลัพธ์
SELECT kpi_type, COUNT(*) as count FROM kpis GROUP BY kpi_type;

-- 7. สร้าง index (ถ้ายังไม่มี)
CREATE INDEX IF NOT EXISTS idx_kpis_kpi_type ON kpis(kpi_type);

-- 8. แสดงโครงสร้างตารางหลังจากแก้ไข
DESCRIBE kpis;
