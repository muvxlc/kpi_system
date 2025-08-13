-- -------------------------------------------------------------
-- TablePlus 6.3.2(586)
--
-- https://tableplus.com/
--
-- Database: kpi_system
-- Generation Time: 2025-03-24 15:37:12.7900
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE `kpis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group` text COLLATE utf8mb4_general_ci,
  `plan` text COLLATE utf8mb4_general_ci,
  `project` text COLLATE utf8mb4_general_ci,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `titleEn` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `detail` text COLLATE utf8mb4_general_ci,
  `objective` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `xfunction` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `var_a` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `var_b` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `icd_code` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `round` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `measure` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `goal` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `alert` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `benchmark` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `method` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ref` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_start` timestamp NULL DEFAULT NULL,
  `dept` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `onwer1` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `onwer2` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `image` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `created_by` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `kpis_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `kpis_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `kpis` (`id`, `group`, `plan`, `project`, `title`, `titleEn`, `detail`, `objective`, `xfunction`, `var_a`, `var_b`, `icd_code`, `round`, `measure`, `goal`, `alert`, `benchmark`, `method`, `ref`, `date_start`, `dept`, `onwer1`, `onwer2`, `note`, `image`, `status`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 'Promotion Prevention & Protection Excellence', 'การพัฒนาคุณภาพชีวิตคนไทยทุกกลุ่มวัย (ด้านสุขภาพ)', 'โครงการพัฒนาและสร้างศักยภาพคนไทยทุกกลุ่มวัย', 'อัตราส่วนการตายมารดาไทยต่อการเกิดมีชีพแสนคน', '-', 'การตายมารดา หมายถึง การตายของมารดาไทยตั้งแต่ขณะตั้งครรภ์ คลอด และหลังคลอด \nภายใน 42 วัน ไม่ว่าอายุครรภ์จะเป็นเท่าใดหรือการตั้งครรภ์ที่ตำแหน่งใด จากสาเหตุ \nที่ เกี่ยวข้องหรือก่อให้เกิดความรุนแรงขึ้นจากการตั้งครรภ์และหรือการดูแลรักษาขณะ\nตั้งครรภ์และคลอดรวมถึงการฆ่าตัวตายแต่ไม่ใช่จากอุบัติเหตุและฆาตรกรรม ต่อการเกิด \nมีชีพแสนคน', '1. พัฒนาระบบบริการสาธารณสุขทุกระดับให้มีคุณภาพตามมาตรฐานอนามัยแม่และเด็ก สำหรับสถานพยาบาลและเครือข่ายระดับจังหวัด 2. เฝ้าระวังหญิงช่วงตั้งครรภ์คลอด และหลังคลอด เพื่อลดการตายของมารดาจากการ  ตั้งครรภ์และการคลอดอย่างมีประสิทธิภาพ 3. จัดระบบการส่งต่อหญิงตั้งครรภ์ภาวะฉุกเฉินอย่างมีประสิทธิภาพ', 'A/B) x 100,000', 'จำนวนมารดาตายระหว่างตั้งครรภ์ คลอด และหลังคลอดภายใน 42 วัน ทุกสาเหตุ ยกเว้นอุบัติเหตุ ในช่วงเวลาที่กำหนด', 'จำนวนเด็กเกิดมีชีพในช่วงเวลาเดียวกัน', '-', 'รายไตรมาส', '-', '-', '-', '-', 'เปรียบเทียบผลการดำเนินงานกับค่าเป้าหมาย', '-', '2025-03-24 08:05:33', '4', '1', 'none', 'เกณฑ์การประเมิน :\nรอบ 3 เดือน รอบ 6 เดือน รอบ 9 เดือน รอบ 12 เดือน\nอัตราส่วนการตายมารดา\nไทยไม่เกิน 16 ต่อการ\nเกิดมีชีพแสนคน\nอัตราส่วนการตายมารดา\nไทยไม่เกิน 16 ต่อการ\nเกิดมีชีพแสนคน\nอัตราส่วนการตายมารดา\nไทยไม่เกิน 16 ต่อการ\nเกิดมีชีพแสนคน\nอัตราส่วนการตายมารดา\nไทยไม่เกิน 16 ต่อการ\nเกิดมีชีพแสนคน', '', 'approved', 1, 1, '2025-03-24 15:22:33', '2025-03-24 15:16:30', '2025-03-24 15:22:33'),
(2, 'Promotion Prevention & Protection Excellence', 'การพัฒนาคุณภาพชีวิตคนไทยทุกกลุ่มวัย (ด้านสุขภาพ)', 'โครงการพัฒนาและสร้างศักยภาพคนไทยทุกกลุ่มวัย', '2. ร้อยละของเด็กอายุ 0 – 5 ปีมีพัฒนาการสมวัย', '-', '- เด็กปฐมวัย หมายถึง เด็กแรกเกิด จนถึงอายุ 5 ปี 11 เดือน 29 วัน\n- พัฒนาการสมวัย หมายถึง เด็กทุกคนได้รับตรวจคัดกรองพัฒนาการโดยใช้คู่มือเฝ้าระวังและส่งเสริมพัฒนาการเด็กปฐมวัย (DSPM) แล้วผลการตรวจคัดกรอง ผ่านครบ 5 ด้าน \nในการตรวจคัดกรองพัฒนาการครั้งแรก รวมกับเด็กที่พบพัฒนาการสงสัยล่าช้าและได้รับการติดตามให้ได้รับการกระตุ้นพัฒนาการ และประเมินซ้ำแล้วผลการประเมิน ผ่านครบ \n5 ด้านภายใน 30 วัน (1B260)\nคำนิยามเพิ่มเติม\n•	การคัดกรองพัฒนาการ หมายถึง ความครอบคลุมของการคัดกรองเด็กอายุ 9, 18, 30, 42 และ 60 เดือน ณ ช่วงเวลาที่มีการคัดกรองโดยเป็นเด็กในพื้นที่ (Type1: มีชื่ออยู่ในทะเบียนบ้าน ตัวอยู่จริงและ Type3 : ที่อาศัยอยู่ในเขต แต่ทะเบียนบ้านอยู่นอกเขต)\n•	พัฒนาการสงสัยล่าช้า หมายถึง เด็กที่ได้รับตรวจคัดกรองพัฒนาการโดยใช้คู่มือเฝ้าระวังและส่งเสริมพัฒนาการเด็กปฐมวัย (DSPM) และ ผลการตรวจคัดกรองพัฒนาการตามอายุของเด็กในการประเมินพัฒนาการครั้งแรกผ่านไม่ครบ 5 ด้าน ทั้งเด็กที่ต้องแนะนำให้พ่อแม่ ผู้ปกครอง ส่งเสริมพัฒนาการตามวัยภายใน 30 วัน (1B261) รวมกับเด็กที่สงสัยล่าช้า  ส่งต่อทันที (1B262 : เด็กที่พัฒนาการล่าช้า/ความผิดปกติอย่างชัดเจน)\n•	พัฒนาการสงสัยล่าช้าได้รับการติดตาม หมายถึง เด็กที่ได้รับการตรวจคัดกรองพัฒนาการตามอายุของเด็กในการประเมินพัฒนาการครั้งแรกผ่านไม่ครบ 5 ด้าน เฉพาะกลุ่มที่แนะนำให้พ่อแม่ ผู้ปกครอง ส่งเสริมพัฒนาการตามวัยภายใน 30 วัน (1B261) แล้วติดตามกลับมาประเมินคัดกรองพัฒนาการครั้งที่ 2 \n•	เด็กพัฒนาการล่าช้า หมายถึง เด็กที่ได้รับตรวจคัดกรองพัฒนาการโดยใช้คู่มือเฝ้าระวังและส่งเสริมพัฒนาการเด็กปฐมวัย (DSPM) แล้วผลการตรวจคัดกรอง ไม่ผ่านครบ 5 ด้าน ในการตรวจคัดกรองพัฒนาการครั้งแรกและครั้งที่ 2 (1B202, 1B212, 1B222, 1B232, 1B242)\n', '1. ส่งเสริมให้เด็กเจริญเติบโต พัฒนาการสมวัย พร้อมเรียนรู้ ตามช่วงวัย  \n2. พัฒนาระบบบริการตามมาตรฐานอนามัยแม่และเด็กคุณภาพของหน่วยบริการทุกระดับ\n3. ส่งเสริมให้ประชาชนมีความตระหนักรู้ เรื่องการเลี้ยงดูเด็กอย่างมีคุณภาพ', '((A_9+a_9 )+(A_18+a_18 )+(A_30+a_30 )+(A_42+a_42 )+(A_60+a_60))/B×100', 'A = จำนวนเด็กอายุ 9, 18, 30, 42 และ 60 เดือน ที่ได้รับการตรวจคัดกรองพัฒนาการโดยใช้คู่มือเฝ้าระวังและส่งเสริมพัฒนาการเด็กปฐมวัย (DSPM) แล้วผลการตรวจคัดกรอง ผ่านครบ 5 ด้าน ในการตรวจคัดกรองพัฒนาการครั้งแรก a = จำนวนเด็กอายุ 9, 18, 30, 42 และ 60 เดือน ที่ได้รับการตรวจคัดกรองพัฒนาการพบพัฒนาการสงสัยล่าช้าและได้รับการติดตามกระตุ้นพัฒนาการ และประเมินซ้ำแล้วผลการประเมิน ผ่านครบ 5 ด้านภายใน 30 วัน(1B260)', 'จำนวนเด็กอายุ 9, 18, 30, 42 และ 60 เดือน ทั้งหมด ในช่วงเวลาที่กำหนด', '-', 'รายไตรมาส', '-', 'ร้อยละ 87', '-', '-', '1. สถานบริการสาธารณสุขทุกระดับ นำข้อมูลการการประเมินพัฒนาการเด็ก บันทึกในโปรแกรมหลักของสถานบริการฯ เช่น JHCIS HosXP PCU เป็นต้น และส่งออกข้อมูลตามโครงสร้างมาตรฐาน 43 แฟ้ม 2. สำนักงานสาธารณสุขจังหวัด ตรวจสอบความถูกต้องของข้อมูล ในระบบ Health Data Center (HDC SERVICE) กระทรวงสาธารณสุข วิเคราะห์และจัดทำสรุปรายงานและประเมินผลตามเกณฑ์เป้าหมายในแต่ละรอบของพื้นที่  3. ศูนย์อนามัยและสถาบันพัฒนาอนามัยเด็กแห่งชาติ  วิเคราะห์ข้อมูลสรุปรายงานและให้ข้อเสนอแนะเชิงนโยบาย', 'สถานบริการสาธารณสุขทุกแห่ง /สำนักงานสาธารณสุขจังหวัด', '2025-03-24 08:22:58', '4', '1', '', '', '', 'pending', 1, NULL, NULL, '2025-03-24 15:34:33', '2025-03-24 15:36:59');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
