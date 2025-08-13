"use client"

import * as React from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({ date, onSelect, disabled, placeholder = "เลือกวันที่" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [year, setYear] = React.useState(() => (date ? date.getFullYear() : new Date().getFullYear()))
  const [month, setMonth] = React.useState(() => (date ? date.getMonth() : new Date().getMonth()))
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const calendarRef = React.useRef<HTMLDivElement>(null)

  // ปิด calendar เมื่อคลิกนอก component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // อัพเดท selectedDate เมื่อ prop date เปลี่ยน
  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(year, month, day)
    setSelectedDate(newDate)
    onSelect(newDate)
    setIsOpen(false)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const renderCalendar = () => {
    const days = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)

    // ปรับให้วันอาทิตย์เป็นวันแรกของสัปดาห์ (0)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

    const dayNames = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"]
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ]

    const calendarDays = []

    // เพิ่มวันว่างก่อนวันที่ 1
    for (let i = 0; i < adjustedFirstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // เพิ่มวันในเดือน
    for (let day = 1; day <= days; day++) {
      calendarDays.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDateSelect(day)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm",
            "cursor-pointer hover:bg-muted",
            isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary",
            isToday(day) && !isSelected(day) && "border border-primary",
          )}
        >
          {day}
        </div>,
      )
    }

    return (
      <div className="p-3" ref={calendarRef}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">
            {monthNames[month]} {year + 543}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
              &lt;
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
              &gt;
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div
              key={day}
              className="flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? format(selectedDate, "PPP", { locale: th }) : <span>{placeholder}</span>}
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 rounded-md border bg-background shadow-md">
          {renderCalendar()}
        </div>
      )}
    </div>
  )
}

