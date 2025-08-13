"use client"

import { useState } from "react"
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
import { MoreHorizontal, Trash, Edit, Key } from "lucide-react"

interface UserTableProps {
  users: any[]
  total: number
  page: number
  limit: number
}

export function UserTable({ users, total, page, limit }: UserTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async () => {
    if (!selectedUserId) return

    setIsLoading(true)

    try {
      // ใช้ window.location.origin แทน process.env.NEXT_PUBLIC_API_URL
      const baseUrl = window.location.origin
      console.log("Deleting user with ID:", selectedUserId)
      console.log("Using base URL:", baseUrl)

      const response = await fetch(`${baseUrl}/api/users/${selectedUserId}`, {
        method: "DELETE",
        credentials: "same-origin", // ใช้ same-origin แทน include
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Delete response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete user")
      }

      toast({
        title: "ลบผู้ใช้สำเร็จ",
        description: "ลบข้อมูลผู้ใช้เรียบร้อยแล้ว",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUserId) return

    setIsLoading(true)

    try {
      // ใช้ fetch API แบบ SameSite
      const response = await fetch(`/api/users/${selectedUserId}/reset-password`, {
        method: "POST",
        credentials: "same-origin", // ใช้ same-origin แทน include
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Reset password response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reset password")
      }

      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว รหัสผ่านใหม่คือ 'password'",
      })

      router.refresh()
    } catch (error) {
      console.error("Error resetting password:", error)

      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
      setIsResetPasswordDialogOpen(false)
    }
  }

  const roleMap: Record<string, string> = {
    admin: "ผู้ดูแลระบบ",
    manager: "ผู้จัดการ",
    approver: "ผู้อนุมัติ",
    user: "ผู้ใช้งาน",
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ชื่อผู้ใช้</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{roleMap[user.role] || user.role}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setIsResetPasswordDialogOpen(true)
                          }}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          <span>รีเซ็ตรหัสผ่าน</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/dashboard/users/${user.id}/edit`)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>แก้ไข</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-600"
                          disabled={user.username === "admin"} // ป้องกันการลบผู้ใช้ admin
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>ลบ</span>
                        </DropdownMenuItem>
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
            onClick={() => router.push(`/dashboard/users?page=${page - 1}`)}
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
            onClick={() => router.push(`/dashboard/users?page=${page + 1}`)}
          >
            ถัดไป
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบผู้ใช้</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการลบผู้ใช้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "กำลังลบ..." : "ลบผู้ใช้"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการรีเซ็ตรหัสผ่าน</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้นี้หรือไม่? รหัสผ่านใหม่จะเป็น 'password'</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

