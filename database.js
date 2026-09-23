const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// En producción (Railway/Render) se monta un volumen persistente en DATA_DIR.
// En local usa la carpeta del proyecto igual que antes.
const dataDir = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'database.sqlite');

// Conectar con la base de datos (se creará automáticamente si no existe)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos SQLite:', err.message);
  } else {
    console.log(`✓ Base de datos SQLite conectada en: ${dbPath}`);
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // 1. Tabla de Usuarios (Soporta nombre de usuario, PIN numérico encriptado y avatar emoji)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        pin TEXT NOT NULL,
        avatar TEXT DEFAULT '🧒',
        coins INTEGER DEFAULT 0,
        inventory TEXT DEFAULT '[]',
        streak_days INTEGER DEFAULT 0,
        last_login_date TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('❌ Error al crear la tabla "users":', err.message);
    });

    // Añadir columnas si no existen (migración segura)
    const userColumns = [
      { name: 'coins', type: 'INTEGER DEFAULT 0' },
      { name: 'inventory', type: "TEXT DEFAULT '[]'" },
      { name: 'streak_days', type: 'INTEGER DEFAULT 0' },
      { name: 'last_login_date', type: "TEXT DEFAULT ''" }
    ];
    userColumns.forEach(col => {
      db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, () => {});
    });

    // 2. Tabla de Progreso (Almacena estrellas, puntos y secciones completadas serializadas como JSON)
    db.run(`
      CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER PRIMARY KEY,
        stars INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        completed_sections TEXT DEFAULT '{}',
        subject_stats TEXT DEFAULT '{}',
        session_history TEXT DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('❌ Error al crear la tabla "progress":', err.message);
    });

    // Migración segura para columnas nuevas de progress
    const progressColumns = [
      { name: 'subject_stats', type: "TEXT DEFAULT '{}'" },
      { name: 'session_history', type: "TEXT DEFAULT '[]'" }
    ];
    progressColumns.forEach(col => {
      db.run(`ALTER TABLE progress ADD COLUMN ${col.name} ${col.type}`, () => {});
    });
  });
}

module.exports = db;
