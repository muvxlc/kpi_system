import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const conn = await createConnection()

    try {
      // สร้างรหัสผ่านที่เข้ารหัสด้วย bcrypt
      const hashedPassword = await bcrypt.hash("password", 10)
      console.log("Generated hashed password:", hashedPassword)

      // อัปเดตรหัสผ่านของผู้ใช้ admin
      await conn.execute("UPDATE users SET password = ? WHERE username = ?", [hashedPassword, "admin"])

      return NextResponse.json({
        success: true,
        message: "รีเซ็ตรหัสผ่านสำเร็จ",
        hashedPassword,
      })
    } finally {
      await conn.end()
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }, { status: 500 })
  }
}

