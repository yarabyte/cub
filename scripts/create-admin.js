/**
 * Crée le premier utilisateur admin dans MySQL.
 * Usage: node scripts/create-admin.js
 * Variables d'environnement (dans .env ou .env.local):
 *   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 */
const path = require("path")
// Charger .env puis .env.local (le second écrase le premier)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") })

const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

function getEnv(name) {
  const v = process.env[name]
  return typeof v === "string" ? v.trim() : ""
}

async function main() {
  const email = getEnv("ADMIN_EMAIL")
  const password = getEnv("ADMIN_PASSWORD")
  if (!email || !password) {
    const missing = []; if (!email) missing.push("ADMIN_EMAIL"); if (!password) missing.push("ADMIN_PASSWORD")
    console.error("Manquant dans .env ou .env.local :", missing.join(", "))
    process.exit(1)
  }
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD doit contenir au moins 12 caractères.")
    process.exit(1)
  }
  const host = getEnv("MYSQL_HOST")
  const user = getEnv("MYSQL_USER") || "root"
  const dbPassword = getEnv("MYSQL_PASSWORD") || getEnv("MYSQL_PWD")
  const database = getEnv("MYSQL_DATABASE") || "cubafoussam"
  if (!host) {
    console.error("Manquant dans .env ou .env.local : MYSQL_HOST")
    process.exit(1)
  }
  const port = parseInt(getEnv("MYSQL_PORT") || "3306", 10)
  const conn = await mysql.createConnection({ host, port, user, password: dbPassword || undefined, database })
  const hash = await bcrypt.hash(password, 12)
  await conn.execute(
    `INSERT INTO admin_users (email, password_hash, role, active) VALUES (?, ?, 'admin', 1)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', active = 1,
       session_version = session_version + 1`,
    [email, hash]
  )
  console.log("Admin user created or updated:", email)
  console.log("Pensez à vider ADMIN_PASSWORD dans votre fichier d'environnement.")
  await conn.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
