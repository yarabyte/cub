/**
 * Met la base à jour pour la synchronisation WordPress, le module Actualités, le formulaire de contact, la médiathèque et l'agenda.
 * Peut être relancé sans risque : seules les modifications manquantes sont appliquées.
 * Usage: npm run db:migrate
 */
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") })

const mysql = require("mysql2/promise")

function getEnv(name) {
  const v = process.env[name]
  return typeof v === "string" ? v.trim() : ""
}

const COLUMNS = [
  { name: "wp_modified_at", definition: "DATETIME NULL AFTER published_at" },
  { name: "author_name", definition: "VARCHAR(255) NULL AFTER wp_modified_at" },
  { name: "categories", definition: "JSON NULL AFTER author_name" },
  { name: "source", definition: "ENUM('wordpress','local') NOT NULL DEFAULT 'wordpress' AFTER categories" },
  { name: "status", definition: "ENUM('draft','published') NOT NULL DEFAULT 'published' AFTER source" },
  { name: "featured", definition: "TINYINT(1) NOT NULL DEFAULT 0 AFTER status" },
  { name: "deleted_at", definition: "DATETIME NULL AFTER featured" },
]

const USER_COLUMNS = [
  { name: "name", definition: "VARCHAR(120) NULL AFTER email" },
  { name: "role", definition: "ENUM('admin','editor') NOT NULL DEFAULT 'admin' AFTER password_hash" },
  { name: "active", definition: "TINYINT(1) NOT NULL DEFAULT 1 AFTER role" },
  { name: "last_login_at", definition: "DATETIME NULL AFTER active" },
  { name: "session_version", definition: "INT NOT NULL DEFAULT 0 AFTER last_login_at" },
]

/** Same palette as lib/categories-db.ts */
const CATEGORY_COLORS = ["#1B4FA8", "#B45309", "#15803D", "#B91C1C", "#7C3AED", "#0E7490", "#0D2F6E", "#A16207"]

async function main() {
  const host = getEnv("MYSQL_HOST")
  const user = getEnv("MYSQL_USER") || "root"
  const password = getEnv("MYSQL_PASSWORD") || getEnv("MYSQL_PWD")
  const database = getEnv("MYSQL_DATABASE") || "cubafoussam"
  const port = parseInt(getEnv("MYSQL_PORT") || "3306", 10)
  if (!host) {
    console.error("Manquant dans .env ou .env.local : MYSQL_HOST")
    process.exit(1)
  }

  const conn = await mysql.createConnection({ host, port, user, password: password || undefined, database })
  const [rows] = await conn.execute(
    "SELECT COLUMN_NAME, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'",
    [database]
  )
  const existing = new Map(rows.map((r) => [r.COLUMN_NAME, r.IS_NULLABLE]))

  let changes = 0
  for (const col of COLUMNS) {
    if (existing.has(col.name)) continue
    await conn.query(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.definition}`)
    console.log(`Colonne ajoutée : ${col.name}`)
    changes += 1
  }

  if (existing.get("wp_id") === "NO") {
    await conn.query("ALTER TABLE articles MODIFY wp_id INT NULL")
    console.log("Colonne wp_id rendue facultative")
    changes += 1
  }

  const [indexes] = await conn.execute(
    "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'articles'",
    [database]
  )
  if (!indexes.some((i) => i.INDEX_NAME === "idx_visibility")) {
    await conn.query("ALTER TABLE articles ADD INDEX idx_visibility (status, deleted_at)")
    console.log("Index ajouté : idx_visibility")
    changes += 1
  }

  const [tables] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('categories','article_categories')",
    [database]
  )
  const tableNames = new Set(tables.map((t) => t.TABLE_NAME))

  if (!tableNames.has("categories")) {
    await conn.query(`CREATE TABLE categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      color VARCHAR(7) NOT NULL DEFAULT '#1B4FA8',
      wp_id INT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    console.log("Table créée : categories")
    changes += 1
  }

  if (!tableNames.has("article_categories")) {
    await conn.query(`CREATE TABLE article_categories (
      article_id INT NOT NULL,
      category_id INT NOT NULL,
      PRIMARY KEY (article_id, category_id),
      INDEX idx_category (category_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )`)
    console.log("Table créée : article_categories")
    changes += 1
  }

  changes += await backfillCategories(conn)

  const [contactTable] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'contact_messages'",
    [database]
  )
  if (contactTable.length === 0) {
    await conn.query(`CREATE TABLE contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(40) NULL,
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('new','read','archived') NOT NULL DEFAULT 'new',
      email_sent_at DATETIME NULL,
      email_error VARCHAR(500) NULL,
      ip VARCHAR(45) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status_created (status, created_at)
    )`)
    console.log("Table créée : contact_messages")
    changes += 1
  }

  const [settingsTable] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'site_settings'",
    [database]
  )
  if (settingsTable.length === 0) {
    await conn.query(`CREATE TABLE site_settings (
      setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
      value JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    console.log("Table créée : site_settings")
    changes += 1
  }

  const [photosTable] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'article_photos'",
    [database]
  )
  if (photosTable.length === 0) {
    await conn.query(`CREATE TABLE article_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      caption VARCHAR(255) NULL,
      position SMALLINT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_article_position (article_id, position),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )`)
    console.log("Table créée : article_photos")
    changes += 1
  }

  changes += await migrateGallery(conn, database)
  changes += await migrateEvents(conn, database)

  const [userCols] = await conn.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'",
    [database]
  )
  const existingUserCols = new Set(userCols.map((r) => r.COLUMN_NAME))
  if (existingUserCols.size > 0) {
    for (const col of USER_COLUMNS) {
      if (existingUserCols.has(col.name)) continue
      await conn.query(`ALTER TABLE admin_users ADD COLUMN ${col.name} ${col.definition}`)
      console.log(`Colonne ajoutée : admin_users.${col.name}`)
      changes += 1
    }
  }

  await conn.end()
  console.log(changes ? `Migration terminée (${changes} modification(s)).` : "Base déjà à jour.")
}

const GALLERY_SEED_KEY = "gallery_seeded"

/** Albums and photos shown on the home page before the médiathèque became editable. */
const GALLERY_SEED = [
  {
    name: "Infrastructure",
    slug: "infrastructure",
    photos: [{ url: "/images/gallery-4.jpg", caption: "Programme de réhabilitation des routes", position: 4 }],
  },
  {
    name: "Culture & Fêtes",
    slug: "culture",
    photos: [
      { url: "/images/gallery-2.jpg", caption: "Palais traditionnel Bamileke", position: 2 },
      { url: "/images/gallery-3.jpg", caption: "Festival des arts et traditions", position: 3 },
    ],
  },
  {
    name: "La Ville",
    slug: "ville",
    photos: [
      { url: "/images/gallery-1.jpg", caption: "Panorama de la ville de Bafoussam", position: 1 },
      { url: "/images/gallery-7.jpg", caption: "Cérémonie à l'Hôtel de Ville", position: 7 },
      { url: "/images/gallery-8.jpg", caption: "Paysage des collines de l'Ouest", position: 8 },
    ],
  },
  {
    name: "Communauté",
    slug: "communaute",
    photos: [
      { url: "/images/gallery-5.jpg", caption: "Grand marché de Bafoussam", position: 5 },
      { url: "/images/gallery-6.jpg", caption: "Espace vert municipal", position: 6 },
    ],
  },
]

/** Creates the médiathèque tables, then adds the original albums and photos once. */
async function migrateGallery(conn, database) {
  const [tables] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('gallery_albums','gallery_photos')",
    [database]
  )
  const tableNames = new Set(tables.map((t) => t.TABLE_NAME))
  let changes = 0

  if (!tableNames.has("gallery_albums")) {
    await conn.query(`CREATE TABLE gallery_albums (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      position SMALLINT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    console.log("Table créée : gallery_albums")
    changes += 1
  }

  if (!tableNames.has("gallery_photos")) {
    await conn.query(`CREATE TABLE gallery_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      album_id INT NULL,
      url VARCHAR(500) NOT NULL,
      caption VARCHAR(255) NULL,
      position INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_position (position),
      INDEX idx_album_position (album_id, position),
      FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE SET NULL
    )`)
    console.log("Table créée : gallery_photos")
    changes += 1
  }

  const [seeded] = await conn.execute("SELECT 1 FROM site_settings WHERE setting_key = ? LIMIT 1", [GALLERY_SEED_KEY])
  if (seeded.length > 0) return changes

  const [counts] = await conn.query(
    "SELECT (SELECT COUNT(*) FROM gallery_albums) AS albums, (SELECT COUNT(*) FROM gallery_photos) AS photos"
  )
  if (Number(counts[0].albums) === 0 && Number(counts[0].photos) === 0) {
    for (const [index, album] of GALLERY_SEED.entries()) {
      const [res] = await conn.execute("INSERT INTO gallery_albums (name, slug, position) VALUES (?, ?, ?)", [
        album.name,
        album.slug,
        index,
      ])
      for (const photo of album.photos) {
        await conn.execute("INSERT INTO gallery_photos (album_id, url, caption, position) VALUES (?, ?, ?, ?)", [
          res.insertId,
          photo.url,
          photo.caption,
          photo.position,
        ])
      }
    }
    console.log("Médiathèque : albums et photos d'origine ajoutés")
    changes += 1
  }
  await conn.execute("INSERT INTO site_settings (setting_key, value) VALUES (?, 'true')", [GALLERY_SEED_KEY])
  return changes
}

const EVENTS_SEED_KEY = "events_seeded"

/** Events hardcoded on the home page before the agenda became editable; imported as drafts. */
const EVENTS_SEED = [
  {
    slug: "forum-pour-le-developpement-de-la-ville",
    title: "Forum pour le Développement de la Ville",
    category: "Développement",
    location: "Palais des Congrès",
    date: "2026-03-10",
    start: "09:00",
    end: "17:00",
    featured: 1,
  },
  {
    slug: "journee-nationale-de-la-salubrite",
    title: "Journée Nationale de la Salubrité",
    category: "Environnement",
    location: "Tous les quartiers",
    date: "2026-03-22",
    start: "07:00",
    end: "12:00",
    featured: 0,
  },
  {
    slug: "session-pleniere-du-conseil-municipal",
    title: "Session Plénière du Conseil Municipal",
    category: "Gouvernance",
    location: "Hôtel de Ville",
    date: "2026-03-28",
    start: "10:00",
    end: "16:00",
    featured: 0,
  },
  {
    slug: "foire-artisanale-et-culturelle-urbaine",
    title: "Foire Artisanale et Culturelle Urbaine",
    category: "Culture",
    location: "Place du Marché Central",
    date: "2026-04-05",
    start: "08:00",
    end: "18:00",
    featured: 0,
  },
  {
    slug: "reunion-de-quartier-zone-industrielle",
    title: "Réunion de Quartier — Zone Industrielle",
    category: "Citoyenneté",
    location: "Mairie Annexe Nord",
    date: "2026-04-19",
    start: "14:00",
    end: "17:00",
    featured: 0,
  },
]

/** Creates the agenda table, then imports the original events once, as drafts. */
async function migrateEvents(conn, database) {
  const [tables] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events'",
    [database]
  )
  let changes = 0
  if (tables.length === 0) {
    await conn.query(`CREATE TABLE events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(200) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(60) NULL,
      location VARCHAR(200) NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      start_time TIME NULL,
      end_time TIME NULL,
      summary VARCHAR(300) NULL,
      content LONGTEXT NULL,
      image_url VARCHAR(500) NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('draft','published') NOT NULL DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status_start (status, start_date)
    )`)
    console.log("Table créée : events")
    changes += 1
  }

  const [seeded] = await conn.execute("SELECT 1 FROM site_settings WHERE setting_key = ? LIMIT 1", [EVENTS_SEED_KEY])
  if (seeded.length > 0) return changes

  const [count] = await conn.query("SELECT COUNT(*) AS n FROM events")
  if (Number(count[0].n) === 0) {
    for (const e of EVENTS_SEED) {
      await conn.execute(
        `INSERT INTO events (slug, title, category, location, start_date, start_time, end_time, featured, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [e.slug, e.title, e.category, e.location, e.date, e.start, e.end, e.featured]
      )
    }
    console.log(`Agenda : ${EVENTS_SEED.length} événements d'origine importés en brouillon`)
    changes += 1
  }
  await conn.execute("INSERT INTO site_settings (setting_key, value) VALUES (?, 'true')", [EVENTS_SEED_KEY])
  return changes
}

/** Builds categories and links from the legacy JSON column of WordPress articles not yet linked. */
async function backfillCategories(conn) {
  const [articles] = await conn.query(
    `SELECT a.id, a.categories FROM articles a
     WHERE a.categories IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM article_categories ac WHERE ac.article_id = a.id)`
  )
  if (articles.length === 0) return 0

  const [countRows] = await conn.query("SELECT COUNT(*) AS n FROM categories")
  let colorIndex = Number(countRows[0].n)
  let links = 0

  for (const article of articles) {
    const cats = typeof article.categories === "string" ? JSON.parse(article.categories) : article.categories
    if (!Array.isArray(cats)) continue
    for (const cat of cats) {
      if (!cat || !cat.slug || !cat.name) continue
      const [found] = await conn.execute("SELECT id FROM categories WHERE wp_id = ? OR slug = ? LIMIT 1", [
        cat.id ?? null,
        cat.slug,
      ])
      let categoryId = found[0]?.id
      if (!categoryId) {
        const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length]
        colorIndex += 1
        const [res] = await conn.execute("INSERT INTO categories (name, slug, color, wp_id) VALUES (?, ?, ?, ?)", [
          cat.name,
          cat.slug,
          color,
          cat.id ?? null,
        ])
        categoryId = res.insertId
        console.log(`Catégorie créée : ${cat.name}`)
      }
      await conn.execute("INSERT IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)", [
        article.id,
        categoryId,
      ])
      links += 1
    }
  }
  console.log(`${links} liaison(s) article/catégorie créée(s)`)
  return links > 0 ? 1 : 0
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
