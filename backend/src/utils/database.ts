import sqlite3 from "sqlite3";
import path from "path";

// Database file path - store in user's home directory or current working directory
const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), "sgf-flow.db");

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
      // Create main games table
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
          filePath TEXT NOT NULL,
          viewed INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `,
        (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Create FTS5 virtual table for full-text search
          db.run(
            `
            CREATE VIRTUAL TABLE IF NOT EXISTS games_fts USING fts5(
              id UNINDEXED,
              white,
              black,
              event,
              round,
              playedAt UNINDEXED,
              content='games',
              content_rowid='rowid'
            )
          `,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              // Create triggers to keep FTS5 in sync with games table
              db.run(
                `
                CREATE TRIGGER IF NOT EXISTS games_ai AFTER INSERT ON games BEGIN
                  INSERT INTO games_fts(rowid, id, white, black, event, round, playedAt)
                  VALUES (new.rowid, new.id, new.white, new.black, new.event, new.round, new.playedAt);
                END
              `,
                (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  db.run(
                    `
                    CREATE TRIGGER IF NOT EXISTS games_ad AFTER DELETE ON games BEGIN
                      INSERT INTO games_fts(games_fts, rowid, id, white, black, event, round, playedAt)
                      VALUES('delete', old.rowid, old.id, old.white, old.black, old.event, old.round, old.playedAt);
                    END
                  `,
                    (err) => {
                      if (err) {
                        reject(err);
                        return;
                      }

                      db.run(
                        `
                        CREATE TRIGGER IF NOT EXISTS games_au AFTER UPDATE ON games BEGIN
                          INSERT INTO games_fts(games_fts, rowid, id, white, black, event, round, playedAt)
                          VALUES('delete', old.rowid, old.id, old.white, old.black, old.event, old.round, old.playedAt);
                          INSERT INTO games_fts(rowid, id, white, black, event, round, playedAt)
                          VALUES (new.rowid, new.id, new.white, new.black, new.event, new.round, new.playedAt);
                        END
                      `,
                        (err) => {
                          if (err) {
                            reject(err);
                          } else {
                            console.log(
                              "Database tables and FTS5 index initialized",
                            );
                            resolve();
                          }
                        },
                      );
                    },
                  );
                },
              );
            },
          );
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
export function dbGet<T = any>(
  sql: string,
  params: any[] = [],
): Promise<T | undefined> {
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
export function dbRun(
  sql: string,
  params: any[] = [],
): Promise<sqlite3.RunResult> {
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
