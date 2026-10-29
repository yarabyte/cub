/**
 * Crée la base MYSQL_DATABASE (cubafoussam par défaut) et ses tables.
 * Utilise les variables MYSQL_* de .env / .env.local.
 * Usage: node scripts/run-init-db.js
 */
const path = require("path")
const fs = require("fs")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") })

const mysql = require("mysql2/promise")

function getEnv(name) {
  const v = process.env[name]
  return typeof v === "string" ? v.trim() : ""
}

async function main() {
  const host = getEnv("MYSQL_HOST")
  const user = getEnv("MYSQL_USER") || "root"
  const password = getEnv("MYSQL_PASSWORD") || getEnv("MYSQL_PWD")
  if (!host) {
    console.error("Manquant : MYSQL_HOST dans .env ou .env.local")
    process.exit(1)
  }
  const port = getEnv("MYSQL_PORT") || "3306"
  const database = getEnv("MYSQL_DATABASE") || "cubafoussam"
  if (!/^[A-Za-z0-9_$]+$/.test(database)) {
    console.error(`Nom de base invalide dans MYSQL_DATABASE : ${database}`)
    process.exit(1)
  }

  const sqlPath = path.join(__dirname, "init-db.sql")
  let sql = fs.readFileSync(sqlPath, "utf8")
  sql = sql.replace(/^\s*--[^\n]*\n/gm, "")
  // init-db.sql names the database "cubafoussam"; hosted databases (Coolify: "default") use MYSQL_DATABASE.
  sql = sql.replace(/\b(CREATE DATABASE IF NOT EXISTS|USE)\s+cubafoussam\b/g, (_, keyword) => `${keyword} \`${database}\``)
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const conn = await mysql.createConnection({
    host,
    port: parseInt(port, 10),
    user,
    password: password || undefined,
    multipleStatements: true,
  })

  for (const statement of statements) {
    if (!statement) continue
    await conn.query(statement)
  }
  await conn.end()
  console.log(`Base ${database} et tables créées.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
