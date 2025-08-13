import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createBangkanConnection } from "@/lib/bangkan-db"

// POST: Query ข้อมูลจากแหล่งภายนอก
export async function POST(request: NextRequest) {
  try {
    console.log("KPI Query API called")
    
    const session = await getServerSession()
    if (!session) {
      console.log("No session found")
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)
    
    const { 
      queryType, 
      queryParams, 
      dataSource 
    } = body

    console.log("Parsed data:", { queryType, queryParams, dataSource })

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!queryType || !dataSource) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    let result: any = null
    let error: string | null = null

    try {
      console.log(`Executing query for dataSource: ${dataSource}, queryType: ${queryType}`)
      
      switch (dataSource) {
        case 'hdc':
          result = await queryHDC(queryType, queryParams)
          break
        case 'mis':
          result = await queryMIS(queryType, queryParams)
          break
        case 'bangkan':
          result = await queryBangkan(queryType, queryParams)
          break
        case 'custom':
          result = await queryCustom(queryType, queryParams)
          break
        default:
          error = "ไม่รองรับแหล่งข้อมูลนี้"
          console.log(`Unsupported dataSource: ${dataSource}`)
      }
      
      console.log("Query result:", result)
    } catch (err) {
      error = `เกิดข้อผิดพลาดในการ query: ${err}`
      console.error("Query execution error:", err)
    }

    if (error) {
      console.log("Returning error:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log("Returning success result")
    return NextResponse.json({ 
      success: true, 
      result,
      dataSource,
      queryType 
    })

  } catch (error) {
    console.error("KPI Query error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการ query ข้อมูล" }, { status: 500 })
  }
}

// Query จากระบบ HDC (Health Data Center)
async function queryHDC(queryType: string, params: any) {
  // จำลองการ query จาก HDC
  // ในระบบจริงจะต้องเชื่อมต่อกับ HDC API
  
  switch (queryType) {
    case 'maternal_mortality':
      // อัตราส่วนการตายมารดา
      return {
        value: Math.floor(Math.random() * 20) + 1, // 1-20
        unit: 'ต่อแสนคน',
        description: 'อัตราส่วนการตายมารดาไทยต่อการเกิดมีชีพแสนคน'
      }
    
    case 'child_development':
      // พัฒนาการเด็ก
      return {
        value: Math.floor(Math.random() * 20) + 80, // 80-100
        unit: '%',
        description: 'ร้อยละของเด็กอายุ 0-5 ปีมีพัฒนาการสมวัย'
      }
    
    case 'customer_satisfaction':
      // ความพึงพอใจลูกค้า
      return {
        value: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        unit: 'คะแนน',
        description: 'คะแนนความพึงพอใจของลูกค้า (1-5)'
      }
    
    default:
      throw new Error(`ไม่รองรับ query type: ${queryType}`)
  }
}

// Query จากระบบ MIS (Management Information System)
async function queryMIS(queryType: string, params: any) {
  // จำลองการ query จาก MIS
  
  switch (queryType) {
    case 'operating_expenses':
      // ค่าใช้จ่ายในการดำเนินงาน
      return {
        value: Math.floor(Math.random() * 1000000) + 5000000, // 5M-6M
        unit: 'บาท',
        description: 'ค่าใช้จ่ายในการดำเนินงานประจำเดือน'
      }
    
    case 'service_time':
      // เวลาในการให้บริการ
      return {
        value: Math.floor(Math.random() * 15) + 20, // 20-35
        unit: 'นาที',
        description: 'เวลาเฉลี่ยในการให้บริการลูกค้า'
      }
    
    case 'training_completion':
      // การอบรมพนักงาน
      return {
        value: Math.floor(Math.random() * 20) + 80, // 80-100
        unit: '%',
        description: 'ร้อยละของพนักงานที่ผ่านการอบรม'
      }
    
    default:
      throw new Error(`ไม่รองรับ query type: ${queryType}`)
  }
}

// Query แบบ Custom (สำหรับกรณีพิเศษ)
async function queryCustom(queryType: string, params: any) {
  // จำลองการ query แบบ custom
  
  if (queryType === 'sql') {
    // จำลองการ query SQL
    return {
      value: Math.floor(Math.random() * 1000) + 100,
      unit: 'รายการ',
      description: `ผลลัพธ์จาก SQL query: ${params.query || 'N/A'}`
    }
  }
  
  if (queryType === 'api') {
    // จำลองการ query จาก API ภายนอก
    return {
      value: Math.floor(Math.random() * 100) + 50,
      unit: 'หน่วย',
      description: `ผลลัพธ์จาก API: ${params.endpoint || 'N/A'}`
    }
  }
  
  throw new Error(`ไม่รองรับ query type: ${queryType}`)
}

// Query จาก Database Bangkan
async function queryBangkan(queryType: string, params: any) {
  try {
    console.log(`Bangkan query called with type: ${queryType}, params:`, params)
    
    const conn = await createBangkanConnection()
    console.log("Bangkan connection established")
    
    try {
      let query = ""
      let queryParams: any[] = []
      
      switch (queryType) {
        case 'population_count':
          // นับจำนวนประชากร
          query = "SELECT COUNT(*) as count FROM population WHERE status = 'active'"
          break
          
        case 'revenue_summary':
          // สรุปรายได้
          query = "SELECT SUM(amount) as total FROM revenue WHERE date BETWEEN ? AND ?"
          queryParams = [params.start_date || '2024-01-01', params.end_date || '2024-12-31']
          break
          
        case 'service_count':
          // นับจำนวนการให้บริการ
          query = "SELECT COUNT(*) as count FROM services WHERE service_date BETWEEN ? AND ?"
          queryParams = [params.start_date || '2024-01-01', params.end_date || '2024-12-31']
          break
          
        case 'count_visit':
          // นับจำนวนการให้บริการ
          query = "SELECT COUNT(vn) as visit FROM ovst WHERE vstdate BETWEEN ? AND ?"
          queryParams = [params.start_date || '2024-01-01', params.end_date || '2024-01-31']
          break
          
        case 'custom_sql':
          // Custom SQL query
          if (!params.sql) {
            throw new Error("ไม่พบ SQL query")
          }
          query = params.sql
          queryParams = params.parameters || []
          break
          
        default:
          throw new Error(`ไม่รองรับ query type: ${queryType} สำหรับ database bangkan`)
      }
      
      console.log(`Executing query: ${query}`)
      console.log(`Query params:`, queryParams)
      
      const [rows] = await conn.execute(query, queryParams)
      const result = (rows as any[])[0]
      
      console.log(`Query result:`, result)
      
      return {
        value: result.count || result.total || result.visit || result.value || 0,
        unit: params.unit || 'หน่วย',
        description: `ผลลัพธ์จาก database bangkan: ${queryType}`,
        raw_data: result
      }
      
    } finally {
      await conn.end()
      console.log("Bangkan connection closed")
    }
    
  } catch (error) {
    console.error("Bangkan query error:", error)
    throw new Error(`เกิดข้อผิดพลาดในการ query database bangkan: ${error}`)
  }
}
