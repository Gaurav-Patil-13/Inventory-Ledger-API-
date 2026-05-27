const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./inventory.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS stock_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            warehouse_id TEXT NOT NULL,
            category TEXT NOT NULL,
            item_name TEXT NOT NULL,
            week_number INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit TEXT NOT NULL,
            recorded_by TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(warehouse_id, category, item_name, week_number)
        )
    `);
});

module.exports = db;
