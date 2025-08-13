# 📊 KPI Analytics System Documentation

## 🎯 ภาพรวมระบบ (System Overview)

ระบบ KPI Analytics เป็นระบบวิเคราะห์และติดตามผลการดำเนินงานตาม KPI (Key Performance Indicators) ที่ออกแบบมาเพื่อช่วยให้ผู้บริหารและทีมงานสามารถ:

- **ติดตามผลการดำเนินงาน** ของ KPI ต่างๆ ในแต่ละช่วงเวลา
- **วิเคราะห์แนวโน้ม** และเปรียบเทียบประสิทธิภาพ
- **ระบุปัญหา** และโอกาสในการปรับปรุง
- **รายงานผล** แบบ real-time และ interactive

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

### Frontend
- **Framework**: Next.js 15.1.0 (React-based)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Custom chart components (BarChart, LineChart, PieChart)
- **State Management**: React hooks (useState, useEffect)

### Backend
- **API Routes**: Next.js API routes
- **Database**: SQL database (PostgreSQL/MySQL)
- **Authentication**: Custom auth system with session management

### Key Components
```
app/
├── dashboard/kpi-analytics/     # Main analytics page
├── api/kpi-analytics/          # Analytics API endpoints
├── components/ui/              # Reusable UI components
└── lib/                       # Utility functions & services
```

---

## 🚀 Features หลัก (Core Features)

### 1. 📊 Dashboard Overview Mode
**วัตถุประสงค์**: แสดงภาพรวมของระบบ KPI ทั้งหมด

#### สิ่งที่แสดง:
- **สถิติรวม**: จำนวน KPI ทั้งหมด, สถานะต่างๆ
- **Performance Cards**: แสดงตัวเลขสำคัญพร้อมเปอร์เซ็นต์
- **Pie Chart**: แสดงสัดส่วนสถานะ KPI (ตามเป้าหมาย/มีความเสี่ยง/ไม่ตามเป้าหมาย)
- **Performance Grid**: แสดงรายละเอียด KPI แต่ละตัว

#### การใช้งาน:
```typescript
// เปลี่ยนโหมดการแสดงผล
<Button onClick={() => setViewMode('overview')}>
  <BarChart3 className="w-4 h-4" />
  ภาพรวม
</Button>
```

---

### 2. 🔍 Detailed Mode
**วัตถุประสงค์**: แสดงรายละเอียดของ KPI แต่ละตัว

#### สิ่งที่แสดง:
- **KPI Information**: ชื่อ, เป้าหมาย, ความสำเร็จ, จำนวนข้อมูล
- **Trend Chart**: กราฟแสดงแนวโน้มการเปลี่ยนแปลง
- **Performance Table**: ตารางแสดงข้อมูลแต่ละรอบการรายงาน

#### ข้อมูลที่แสดง:
- **เป้าหมาย**: ค่าเป้าหมายของ KPI
- **ความสำเร็จ**: เปอร์เซ็นต์ความสำเร็จ
- **จำนวนข้อมูล**: จำนวนรอบการรายงานที่มีข้อมูล
- **แนวโน้ม**: เพิ่มขึ้น/ลดลง/คงที่

---

### 3. 📈 Comparison Mode
**วัตถุประสงค์**: เปรียบเทียบประสิทธิภาพระหว่าง KPI ต่างๆ

#### สิ่งที่แสดง:
- **Achievement Comparison Chart**: กราฟแท่งเปรียบเทียบ % ความสำเร็จ
- **Top Performers**: KPI ที่ทำได้ดีที่สุด 5 อันดับ
- **Need Attention**: KPI ที่ต้องการความสนใจ 5 อันดับ

#### การวิเคราะห์:
```typescript
// เรียงลำดับตามประสิทธิภาพ
.sort((a, b) => b.achievement_percentage - a.achievement_percentage)
.slice(0, 5)
```

---

## 🎛️ ตัวกรองข้อมูล (Data Filters)

### 1. ปีงบประมาณ (Fiscal Year)
- **ประเภท**: Dropdown selection
- **ค่าเริ่มต้น**: ปีปัจจุบัน
- **การทำงาน**: กรองข้อมูลตามปีงบประมาณที่เลือก

### 2. รอบการรายงาน (Reporting Period)
- **ตัวเลือก**:
  - ทั้งหมด
  - รอบ 3 เดือน
  - รอบ 6 เดือน
  - รอบ 9 เดือน
  - รอบปีงบประมาณ

### 3. เลือก KPI
- **ประเภท**: Dropdown with search
- **ค่าเริ่มต้น**: ทั้งหมด
- **การทำงาน**: กรองเฉพาะ KPI ที่เลือก

---

## 📊 Chart Components

### 1. BarChart
```typescript
<BarChart
  data={[
    { label: 'KPI 1', value: 85, color: '#10b981' },
    { label: 'KPI 2', value: 72, color: '#f59e0b' }
  ]}
  height={200}
  showValues={true}
/>
```

### 2. LineChart
```typescript
<LineChart
  data={kpi.actual_values.map(value => ({
    label: value.period,
    value: value.value
  }))}
  height={128}
  showGrid={true}
/>
```

### 3. PieChart
```typescript
<PieChart
  data={[
    { label: 'ตามเป้าหมาย', value: stats.on_track, color: '#10b981' },
    { label: 'มีความเสี่ยง', value: stats.at_risk, color: '#f59e0b' }
  ]}
  size={200}
  showLabels={true}
/>
```

---

## 🔐 ระบบ Authentication

### การตรวจสอบสิทธิ์
```typescript
const { user } = useAuth()

// ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงหรือไม่
if (!user) {
  return <div>กรุณาเข้าสู่ระบบ</div>
}
```

### Session Management
- ใช้ custom auth context
- รองรับการ logout และ session timeout
- ตรวจสอบสิทธิ์ในทุก API call

---

## 🌐 API Endpoints

### 1. GET /api/kpi-analytics
**วัตถุประสงค์**: ดึงข้อมูล analytics และสถิติ

#### Parameters:
```typescript
{
  fiscalYear?: number,    // ปีงบประมาณ
  period?: string,        // รอบการรายงาน
  kpiId?: string         // ID ของ KPI
}
```

#### Response:
```typescript
{
  analytics: KPIAnalytics[],
  stats: DashboardStats
}
```

### 2. GET /api/kpi
**วัตถุประสงค์**: ดึงรายการ KPI ทั้งหมด

#### Response:
```typescript
{
  kpis: Array<{
    id: number,
    title: string
  }>
}
```

---

## 🗄️ Data Models

### KPIAnalytics Interface
```typescript
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
```

### DashboardStats Interface
```typescript
interface DashboardStats {
  total_kpis: number
  on_track: number
  at_risk: number
  off_track: number
  average_achievement: number
  total_results: number
}
```

---

## 🧩 UI Components

### 1. Card Components
- **Card**: Container หลักสำหรับ content
- **CardHeader**: ส่วนหัวของ card
- **CardTitle**: หัวข้อของ card
- **CardContent**: เนื้อหาของ card

### 2. Button Components
- **Default**: ปุ่มหลัก (สีน้ำเงิน)
- **Outline**: ปุ่มขอบ (สีขาวขอบ)
- **Destructive**: ปุ่มลบ (สีแดง)

### 3. Form Components
- **Select**: Dropdown selection
- **Label**: ป้ายกำกับ
- **Badge**: แสดงสถานะหรือ tag

---

## 🔧 Utility Functions

### 1. getStatusColor()
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_track': return 'bg-green-100 text-green-800'
    case 'at_risk': return 'bg-yellow-100 text-yellow-800'
    case 'off_track': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
```

### 2. getTrendIcon()
```typescript
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />
    case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
    case 'stable': return <Activity className="w-4 h-4 text-blue-600" />
    default: return <Activity className="w-4 h-4 text-gray-600" />
  }
}
```

### 3. getStatusLabel()
```typescript
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'on_track': return 'ตามเป้าหมาย'
    case 'at_risk': return 'มีความเสี่ยง'
    case 'off_track': return 'ไม่ตามเป้าหมาย'
    default: return 'ไม่ระบุ'
  }
}
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px` - แสดงเป็น 1 คอลัมน์
- **Tablet**: `768px - 1024px` - แสดงเป็น 2 คอลัมน์
- **Desktop**: `> 1024px` - แสดงเป็น 3-4 คอลัมน์

### Grid System
```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🚀 Performance Optimizations

### 1. Data Fetching
- ใช้ `useEffect` เพื่อ fetch ข้อมูลเมื่อ dependencies เปลี่ยน
- Implement loading states เพื่อ UX ที่ดี
- Error handling สำหรับ API calls

### 2. Component Optimization
- แยก components ออกจากกันเพื่อลด re-renders
- ใช้ `useMemo` สำหรับ calculations ที่ซับซ้อน
- Lazy loading สำหรับ charts ที่ไม่จำเป็น

### 3. Memory Management
- Cleanup functions ใน useEffect
- ไม่เก็บข้อมูลที่ไม่จำเป็นใน state

---

## 🧪 Testing Strategy

### 1. Unit Tests
- Test utility functions
- Test component rendering
- Test state management

### 2. Integration Tests
- Test API integration
- Test user interactions
- Test data flow

### 3. E2E Tests
- Test complete user workflows
- Test responsive design
- Test cross-browser compatibility

---

## 🔒 Security Considerations

### 1. Authentication
- ตรวจสอบสิทธิ์ในทุก API endpoint
- ใช้ secure session management
- Implement proper logout

### 2. Data Validation
- Validate input parameters
- Sanitize user inputs
- Prevent SQL injection

### 3. Access Control
- Role-based access control
- Audit logging
- Secure data transmission

---

## 📈 Future Enhancements

### 1. Advanced Analytics
- Predictive analytics
- Machine learning insights
- Custom KPI formulas

### 2. Reporting Features
- Export to PDF/Excel
- Scheduled reports
- Custom dashboards

### 3. Integration
- Third-party BI tools
- API for external systems
- Real-time notifications

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Chart Not Rendering
- ตรวจสอบว่า data array ไม่เป็น empty
- ตรวจสอบ CSS classes และ styling
- ตรวจสอบ console errors

#### 2. API Errors
- ตรวจสอบ network connectivity
- ตรวจสอบ API endpoint URLs
- ตรวจสอบ authentication status

#### 3. Performance Issues
- ตรวจสอบ data size
- ใช้ pagination สำหรับข้อมูลจำนวนมาก
- Optimize chart rendering

---

## 📚 References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Libraries
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Chart.js](https://www.chartjs.org/)

---

## 🆘 Support

หากมีปัญหาหรือต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อได้ที่:
- **Email**: support@kpi-system.com
- **Documentation**: https://docs.kpi-system.com
- **GitHub Issues**: https://github.com/kpi-system/issues

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm หรือ pnpm
- Database (PostgreSQL/MySQL)

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/kpi-analytics.git

# Install dependencies
cd kpi-analytics
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/kpi_db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

---

*Documentation นี้ถูกอัปเดตล่าสุดเมื่อ: {{ current_date }}*

---

## 📝 License

MIT License - ดูรายละเอียดเพิ่มเติมได้ที่ [LICENSE](LICENSE) file
