import mysql from "mysql2/promise"

export async function createConnection() {
  // ใช้ environment variables แทนค่าที่กำหนดไว้ตายตัว
  return await mysql.createConnection({
    host: process.env.DB_HOST || "192.168.100.221",
    user: process.env.DB_USER || "kpi",
    password: process.env.DB_PASSWORD || "kpikpi1",
    database: process.env.DB_NAME || "kpi",
    port: Number.parseInt(process.env.DB_PORT || "8889"),
  })
}

