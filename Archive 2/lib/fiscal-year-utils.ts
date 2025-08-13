/**
 * Utility functions สำหรับจัดการปีงบประมาณ
 * ปีงบประมาณเริ่มต้น 1 ตุลาคม และสิ้นสุด 30 กันยายน
 */

export interface FiscalYearPeriod {
  fiscalYear: number
  period: '3' | '6' | '9' | '12'
  periodStart: Date
  periodEnd: Date
  periodName: string
}

/**
 * คำนวณปีงบประมาณจากวันที่
 */
export function getFiscalYear(date: Date = new Date()): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth() return 0-11
  
  // ถ้าเดือน >= 10 (ตุลาคม) ให้เป็นปีงบประมาณของปีถัดไป
  if (month >= 10) {
    return year + 543 + 1 // แปลงเป็น พ.ศ. และบวก 1
  }
  
  return year + 543 // แปลงเป็น พ.ศ.
}

/**
 * คำนวณวันที่เริ่มต้นและสิ้นสุดของปีงบประมาณ
 */
export function getFiscalYearRange(fiscalYear: number): { start: Date; end: Date } {
  const startYear = fiscalYear - 543 - 1 // แปลงกลับเป็น ค.ศ. และลบ 1
  
  return {
    start: new Date(startYear, 9, 1), // 1 ตุลาคม (month 9 = ตุลาคม)
    end: new Date(startYear + 1, 8, 30) // 30 กันยายน (month 8 = กันยายน)
  }
}

/**
 * คำนวณช่วงเวลาของรอบการรายงาน
 */
export function getPeriodRange(fiscalYear: number, period: '3' | '6' | '9' | '12'): { start: Date; end: Date } {
  const fiscalStart = getFiscalYearRange(fiscalYear).start
  
  switch (period) {
    case '3':
      return {
        start: fiscalStart,
        end: new Date(fiscalStart.getFullYear(), 11, 31) // 31 ธันวาคม
      }
    case '6':
      return {
        start: fiscalStart,
        end: new Date(fiscalStart.getFullYear() + 1, 2, 31) // 31 มีนาคม
      }
    case '9':
      return {
        start: fiscalStart,
        end: new Date(fiscalStart.getFullYear() + 1, 5, 30) // 30 มิถุนายน
      }
    case '12':
      return getFiscalYearRange(fiscalYear)
  }
}

/**
 * สร้างรายการรอบการรายงานทั้งหมดของปีงบประมาณ
 */
export function getAllFiscalYearPeriods(fiscalYear: number): FiscalYearPeriod[] {
  const periods: FiscalYearPeriod[] = []
  
  for (const period of ['3', '6', '9', '12'] as const) {
    const range = getPeriodRange(fiscalYear, period)
    periods.push({
      fiscalYear,
      period,
      periodStart: range.start,
      periodEnd: range.end,
      periodName: getPeriodName(period)
    })
  }
  
  return periods
}

/**
 * แปลงชื่อรอบการรายงาน
 */
export function getPeriodName(period: '3' | '6' | '9' | '12'): string {
  switch (period) {
    case '3': return 'รอบ 3 เดือน (ต.ค.-ธ.ค.)'
    case '6': return 'รอบ 6 เดือน (ต.ค.-มี.ค.)'
    case '9': return 'รอบ 9 เดือน (ต.ค.-มิ.ย.)'
    case '12': return 'รอบปีงบประมาณ (ต.ค.-ก.ย.)'
  }
}

/**
 * ตรวจสอบว่าวันที่อยู่ในรอบการรายงานหรือไม่
 */
export function isDateInPeriod(date: Date, fiscalYear: number, period: '3' | '6' | '9' | '12'): boolean {
  const range = getPeriodRange(fiscalYear, period)
  return date >= range.start && date <= range.end
}

/**
 * คำนวณร้อยละความสำเร็จ
 */
export function calculateAchievement(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.round((actual / target) * 100 * 100) / 100 // รองทศนิยม 2 ตำแหน่ง
}

/**
 * สร้างรายการปีงบประมาณล่าสุด 5 ปี
 */
export function getRecentFiscalYears(count: number = 5): number[] {
  const currentFiscalYear = getFiscalYear()
  const years: number[] = []
  
  for (let i = 0; i < count; i++) {
    years.push(currentFiscalYear - i)
  }
  
  return years
}
