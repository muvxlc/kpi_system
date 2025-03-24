import mysql from "mysql2/promise"

export async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "kpi_system",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
  })
}

