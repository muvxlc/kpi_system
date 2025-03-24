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
import { approveKpi } from "@/lib/kpi-service"
import { Check } from "lucide-react"

interface ApproveKpiButtonProps {
  kpiId: number
}

export function ApproveKpiButton({ kpiId }: ApproveKpiButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleApprove = async () => {
    setIsLoading(true)

    try {
      await approveKpi(kpiId)

      toast({
        title: "อนุมัติสำเร็จ",
        description: "อนุมัติ KPI เรียบร้อยแล้ว",
      })

      router.refresh()
    } catch (error) {
      console.error("Error approving KPI:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอนุมัติ KPI ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Check className="mr-2 h-4 w-4" />
        อนุมัติ
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการอนุมัติ</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการอนุมัติ KPI นี้หรือไม่?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isLoading}>
              {isLoading ? "กำลังอนุมัติ..." : "อนุมัติ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

