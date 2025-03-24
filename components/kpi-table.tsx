"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Check, Trash, Edit, Eye, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface KpiTableProps {
  kpis: any[]
  total: number
  page: number
  limit: number
  userRole: string
}

export function KpiTable({ kpis, total, page, limit, userRole }: KpiTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isUnapproveDialogOpen, setIsUnapproveDialogOpen] = useState(false)
  const [selectedKpiId, setSelectedKpiId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth() // ใช้ useAuth hook เพื่อตรวจสอบสถานะการล็อกอิน

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async () => {
    if (!selectedKpiId) return

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
      const url = `${window.location.origin}/api/kpi/${selectedKpiId}`

      console.log("Deleting KPI with ID:", selectedKpiId)
      console.log("API URL:", url)

      try {
        const response = await fetch(url, {
          method: "DELETE",
          credentials: "include", // เปลี่ยนจาก same-origin เป็น include
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Delete response status:", response.status)

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

          throw new Error(errorData.error || "Failed to delete KPI")
        }

        toast({
          title: "ลบข้อมูลสำเร็จ",
          description: "ลบข้อมูล KPI เรียบร้อยแล้ว",
        })

        router.refresh()
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting KPI:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูล KPI ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedKpiId) return

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
      const url = `${window.location.origin}/api/kpi/${selectedKpiId}/approve`

      console.log("Approving KPI with ID:", selectedKpiId)
      console.log("API URL:", url)
      console.log("Current user:", user)

      // ตรวจสอบ cookies ที่มีอยู่
      console.log("Document cookies:", document.cookie)

      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "include", // เปลี่ยนจาก same-origin เป็น include
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Response status:", response.status)

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

          throw new Error(errorData.error || "Failed to approve KPI")
        }

        toast({
          title: "อนุมัติสำเร็จ",
          description: "อนุมัติ KPI เรียบร้อยแล้ว",
        })

        router.refresh()
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error approving KPI:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอนุมัติ KPI ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
      setIsApproveDialogOpen(false)
    }
  }

  const handleUnapprove = async () => {
    if (!selectedKpiId) return

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
      const url = `${window.location.origin}/api/kpi/${selectedKpiId}/unapprove`

      console.log("Unapproving KPI with ID:", selectedKpiId)
      console.log("API URL:", url)

      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Response status:", response.status)

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
      setIsUnapproveDialogOpen(false)
    }
  }

  const canApprove = userRole === "admin" || userRole === "approver"
  const canDelete = userRole === "admin"

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>หัวข้อ</TableHead>
              <TableHead>กลุ่ม</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>เจ้าของ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kpis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              kpis.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell>{kpi.title}</TableCell>
                  <TableCell>{kpi.group}</TableCell>
                  <TableCell>{kpi.dept_name}</TableCell>
                  <TableCell>{kpi.owner1_name}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        kpi.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {kpi.status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">เมนู</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/kpi/${kpi.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>ดูรายละเอียด</span>
                          </Link>
                        </DropdownMenuItem>
                        {(userRole === "admin" || kpi.onwer1 === user?.id || kpi.onwer2 === user?.id) && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/kpi/${kpi.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>แก้ไข</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {canApprove && kpi.status !== "approved" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedKpiId(kpi.id)
                              setIsApproveDialogOpen(true)
                            }}
                            disabled={isLoading}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            <span>อนุมัติ</span>
                          </DropdownMenuItem>
                        )}
                        {canApprove && kpi.status === "approved" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedKpiId(kpi.id)
                              setIsUnapproveDialogOpen(true)
                            }}
                            disabled={isLoading}
                          >
                            <X className="mr-2 h-4 w-4" />
                            <span>ยกเลิกการอนุมัติ</span>
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedKpiId(kpi.id)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>ลบ</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(`/dashboard/kpi?page=${page - 1}`)}
          >
            ก่อนหน้า
          </Button>
          <span className="text-sm">
            หน้า {page} จาก {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => router.push(`/dashboard/kpi?page=${page + 1}`)}
          >
            ถัดไป
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบข้อมูล</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการลบข้อมูล KPI นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "กำลังลบ..." : "ลบข้อมูล"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
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

      <AlertDialog open={isUnapproveDialogOpen} onOpenChange={setIsUnapproveDialogOpen}>
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

