const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function openDatabase(filename = process.env.DATABASE_PATH || './data/smart-links.db') {
  const resolved = path.resolve(filename);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const db = new Database(resolved);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS smart_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      destination_url TEXT NOT NULL, source TEXT NOT NULL DEFAULT '', is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS click_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, smart_link_id INTEGER NOT NULL, timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      referrer TEXT, user_agent TEXT, device_type TEXT, browser TEXT, os TEXT, in_app_browser TEXT, ip_hash TEXT,
      utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
      FOREIGN KEY (smart_link_id) REFERENCES smart_links(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_click_link ON click_events(smart_link_id);
    CREATE INDEX IF NOT EXISTS idx_click_time ON click_events(timestamp);
  `);
  return db;
}
module.exports = { openDatabase };
