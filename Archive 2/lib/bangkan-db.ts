import mysql from "mysql2/promise"

export async function createBangkanConnection() {
  return await mysql.createConnection({
    host: process.env.BANGKAN_DB_HOST || "192.168.1.243",
    user: process.env.BANGKAN_DB_USER || "kpi",
    password: process.env.BANGKAN_DB_PASSWORD || "kpi@bkh",
    database: process.env.BANGKAN_DB_NAME || "bangkan",
    port: Number.parseInt(process.env.BANGKAN_DB_PORT || "3306"),
  })
}
