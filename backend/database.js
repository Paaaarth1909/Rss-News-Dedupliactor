const Database = require("better-sqlite3");

// create DB file
const db = new Database("news.db");

// create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    link TEXT UNIQUE,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;