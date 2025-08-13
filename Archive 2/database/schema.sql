-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS kpi_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kpi_system;

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role ENUM('admin', 'manager', 'approver', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตาราง departments
CREATE TABLE IF NOT EXISTS departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตาราง kpis
CREATE TABLE IF NOT EXISTS kpis (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  `group` TEXT,
  plan TEXT,
  project TEXT,
  title VARCHAR(255) NOT NULL,
  titleEn VARCHAR(255),
  detail TEXT,
  objective VARCHAR(255),
  xfunction VARCHAR(255),
  var_a VARCHAR(255),
  var_b VARCHAR(255),
  icd_code VARCHAR(255),
  round VARCHAR(255),
  measure VARCHAR(255),
  goal VARCHAR(255),
  alert VARCHAR(255),
  benchmark VARCHAR(255),
  method VARCHAR(255),
  ref VARCHAR(255),
  date_start TIMESTAMP,
  dept VARCHAR(255),
  onwer1 VARCHAR(255),
  onwer2 VARCHAR(255),
  note VARCHAR(255),
  image TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_by BIGINT,
  approved_by BIGINT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- เพิ่มข้อมูลตัวอย่าง
-- ผู้ใช้งาน (รหัสผ่าน: password)
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2a$10$JrqzZvYkNTRv7SYMpZxXDOw5yCQgM8j8V5en1kF6Ik3Pbh4XkwZeC', 'ผู้ดูแลระบบ', 'admin'),
('manager', '$2a$10$JrqzZvYkNTRv7SYMpZxXDOw5yCQgM8j8V5en1kF6Ik3Pbh4XkwZeC', 'ผู้จัดการ', 'manager'),
('approver', '$2a$10$JrqzZvYkNTRv7SYMpZxXDOw5yCQgM8j8V5en1kF6Ik3Pbh4XkwZeC', 'ผู้อนุมัติ', 'approver'),
('user1', '$2a$10$JrqzZvYkNTRv7SYMpZxXDOw5yCQgM8j8V5en1kF6Ik3Pbh4XkwZeC', 'ผู้ใช้งาน 1', 'user'),
('user2', '$2a$10$JrqzZvYkNTRv7SYMpZxXDOw5yCQgM8j8V5en1kF6Ik3Pbh4XkwZeC', 'ผู้ใช้งาน 2', 'user');

-- แผนก
INSERT INTO departments (name) VALUES
('แผนกบริหาร'),
('แผนกการเงิน'),
('แผนกบุคคล'),
('แผนกไอที'),
('แผนกการตลาด'),
('แผนกขาย');

-- KPI ตัวอย่าง
INSERT INTO kpis (`group`, plan, project, title, titleEn, detail, objective, xfunction, var_a, var_b, icd_code, round, measure, goal, alert, benchmark, method, ref, date_start, dept, onwer1, onwer2, status, created_by) VALUES
('ด้านการเงิน', 'แผนประจำปี 2566', 'โครงการลดต้นทุน', 'ลดค่าใช้จ่ายในการดำเนินงาน', 'Reduce Operating Expenses', 'ลดค่าใช้จ่ายในการดำเนินงานลง 10% เทียบกับปีที่ผ่านมา', 'เพื่อเพิ่มประสิทธิภาพในการบริหารต้นทุน', 'ร้อยละ', '100', '10', 'FIN-001', 'รายไตรมาส', 'ร้อยละของค่าใช้จ่ายที่ลดลง', '10%', '5%', '8%', 'เปรียบเทียบค่าใช้จ่ายกับปีที่ผ่านมา', 'รายงานการเงินประจำปี', NOW(), '2', '1', '2', 'approved', 1),
('ด้านลูกค้า', 'แผนประจำปี 2566', 'โครงการพัฒนาความพึงพอใจลูกค้า', 'เพิ่มความพึงพอใจของลูกค้า', 'Increase Customer Satisfaction', 'เพิ่มคะแนนความพึงพอใจของลูกค้าให้ได้อย่างน้อย 4.5 จาก 5 คะแนน', 'เพื่อรักษาฐานลูกค้าและเพิ่มโอกาสในการขาย', 'คะแนน', '5', '4.5', 'CUS-001', 'รายเดือน', 'คะแนนความพึงพอใจเฉลี่ย', '4.5', '4.0', '4.2', 'สำรวจความพึงพอใจของลูกค้า', 'แบบสำรวจความพึงพอใจ', NOW(), '5', '2', '4', 'pending', 2),
('ด้านกระบวนการภายใน', 'แผนประจำปี 2566', 'โครงการปรับปรุงกระบวนการทำงาน', 'ลดเวลาในการให้บริการลูกค้า', 'Reduce Customer Service Time', 'ลดระยะเวลาในการให้บริการลูกค้าลง 20%', 'เพื่อเพิ่มประสิทธิภาพในการให้บริการ', 'นาที', '30', '24', 'PRO-001', 'รายสัปดาห์', 'ระยะเวลาเฉลี่ยในการให้บริการ', '24 นาที', '28 นาที', '25 นาที', 'จับเวลาการให้บริการ', 'รายงานการให้บริการ', NOW(), '6', '3', NULL, 'approved', 3),
('ด้านการเรียนรู้และพัฒนา', 'แผนประจำปี 2566', 'โครงการพัฒนาบุคลากร', 'เพิ่มทักษะของพนักงาน', 'Increase Employee Skills', 'พนักงานทุกคนต้องผ่านการอบรมอย่างน้อย 2 หลักสูตรต่อปี', 'เพื่อพัฒนาศักยภาพของบุคลากร', 'หลักสูตร', '2', '100', 'LEA-001', 'รายปี', 'ร้อยละของพนักงานที่ผ่านการอบรม 2 หลักสูตร', '100%', '80%', '90%', 'ติดตามการเข้าอบรมของพนักงาน', 'ระบบบันทึกการอบรม', NOW(), '3', '4', '1', 'pending', 4);

