import sqlite3 from "sqlite3";
import path from "path";

// Database file path - store in user's home directory or current working directory
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "sgf-flow.db");

/**
 * SQLite database instance
 */
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    throw err;
  }
  console.log(`Connected to SQLite database at ${DB_PATH}`);
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

/**
 * Initialize database tables
 */
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `
        CREATE TABLE IF NOT EXISTS games (
          id TEXT PRIMARY KEY,
          playedAt TEXT NOT NULL,
          round TEXT NOT NULL,
          event TEXT NOT NULL,
          komi TEXT NOT NULL,
          white TEXT NOT NULL,
          black TEXT NOT NULL,
          whiteRank TEXT NOT NULL,
          blackRank TEXT NOT NULL,
          whiteWins INTEGER NOT NULL,
          blackWins INTEGER NOT NULL,
          result TEXT NOT NULL,
          createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("Database tables initialized");
            resolve();
          }
        },
      );
    });
  });
}

/**
 * Helper function to run SQL queries that return results
 */
export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

/**
 * Helper function to run SQL queries that return a single result
 */
export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

/**
 * Helper function to run SQL queries that don't return results
 */
export function dbRun(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Close database connection
 */
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
