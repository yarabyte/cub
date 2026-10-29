import mysql from "mysql2/promise"

/** Survives dev hot reloads, which would otherwise leak a new pool on every re-evaluation. */
const globalForDb = globalThis as unknown as { mysqlPool?: mysql.Pool }

function getPool(): mysql.Pool | null {
  if (globalForDb.mysqlPool) return globalForDb.mysqlPool
  const host = process.env.MYSQL_HOST
  const user = process.env.MYSQL_USER ?? "root"
  const password = process.env.MYSQL_PASSWORD ?? process.env.MYSQL_PWD ?? ""
  const database = process.env.MYSQL_DATABASE ?? "cubafoussam"
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306
  if (!host) return null
  globalForDb.mysqlPool = mysql.createPool({
    host,
    port,
    user,
    password: password || undefined,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 2,
    idleTimeout: 60_000,
    queueLimit: 0,
  })
  return globalForDb.mysqlPool
}

export function getDb(): mysql.Pool | null {
  return getPool()
}

export async function query<T = unknown>(
  sql: string,
  params?: (string | number | null | Date)[]
): Promise<T> {
  const db = getDb()
  if (!db) throw new Error("MySQL not configured: set MYSQL_HOST and MYSQL_PASSWORD")
  const [rows] = await db.execute(sql, params)
  return rows as T
}
