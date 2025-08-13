"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface UnapproveKpiButtonProps {
  kpiId: number
}

export function UnapproveKpiButton({ kpiId }: UnapproveKpiButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const handleUnapprove = async () => {
    setIsLoading(true)

    try {
      // ตรวจสอบสถานะการล็อกอิน
      if (!user) {
        console.error("User not logged in")
        toast({
          variant: "destructive",
          title: "ไม่ได้เข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        })
        router.push("/login")
        return
      }

      // สร้าง URL ที่ถูกต้อง - ใช้ window.location.origin เพื่อให้แน่ใจว่าเป็น origin เดียวกัน
      const url = `${window.location.origin}/api/kpi/${kpiId}/unapprove`

      console.log("Unapproving KPI with ID:", kpiId)
      console.log("API URL:", url)
      console.log("Current user:", user)

      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Unapprove response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Error response data:", errorData)

          // ถ้าเป็น 401 (Unauthorized) ให้ redirect ไปหน้า login
          if (response.status === 401) {
            toast({
              variant: "destructive",
              title: "เซสชันหมดอายุ",
              description: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
            })
            router.push("/login")
            return
          }

          throw new Error(errorData.error || "Failed to unapprove KPI")
        }

        toast({
          title: "ยกเลิกการอนุมัติสำเร็จ",
          description: "ยกเลิกการอนุมัติ KPI เรียบร้อยแล้ว",
        })

        router.refresh()
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error unapproving KPI:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกการอนุมัติ KPI ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline">
        <X className="mr-2 h-4 w-4" />
        ยกเลิกการอนุมัติ
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกการอนุมัติ</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการยกเลิกการอนุมัติ KPI นี้หรือไม่?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnapprove} disabled={isLoading}>
              {isLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

