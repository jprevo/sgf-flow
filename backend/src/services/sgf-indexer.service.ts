import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { db, dbAll, dbRun } from "../utils/database";
import { SgfParser } from "./sgf-parser.service";
import { getSgfDirectories } from "./sgf-directory.service";

/**
 * Progress update sent during indexing
 */
export interface IndexProgress {
  phase: "scanning" | "indexing" | "cleanup" | "complete";
  filesScanned: number;
  filesIndexed: number;
  filesSkipped: number;
  filesRemoved: number;
  currentFile?: string;
  error?: string;
}

/**
 * Service for indexing SGF files from configured directories
 */
export class SgfIndexerService {
  private static readonly BATCH_SIZE = 500;
  private static readonly SGF_EXTENSION = ".sgf";

  /**
   * Generates a unique ID for a file based on its path
   * @param filePath - Absolute file path
   * @returns Hash-based ID
   */
  private static generateFileId(filePath: string): string {
    return createHash("sha256").update(filePath).digest("hex");
  }

  /**
   * Recursively scans a directory for SGF files
   * @param dirPath - Directory to scan
   * @returns Array of absolute SGF file paths
   */
  private static async scanDirectory(dirPath: string): Promise<string[]> {
    const sgfFiles: string[] = [];

    const scanRecursive = async (currentPath: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(currentPath, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);

          if (entry.isDirectory()) {
            await scanRecursive(fullPath);
          } else if (
            entry.isFile() &&
            entry.name.toLowerCase().endsWith(this.SGF_EXTENSION)
          ) {
            sgfFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
        console.error(`Error scanning directory ${currentPath}:`, error);
      }
    };

    await scanRecursive(dirPath);
    return sgfFiles;
  }

  /**
   * Indexes all SGF files from configured directories
   * @param progressCallback - Called with progress updates
   */
  public static async indexAll(
    progressCallback: (progress: IndexProgress) => void,
  ): Promise<void> {
    const progress: IndexProgress = {
      phase: "scanning",
      filesScanned: 0,
      filesIndexed: 0,
      filesSkipped: 0,
      filesRemoved: 0,
    };

    try {
      // Get all configured directories
      const directories = getSgfDirectories();
      if (directories.length === 0) {
        progressCallback({
          ...progress,
          phase: "complete",
        });
        return;
      }

      // Scan all directories for SGF files
      progressCallback(progress);
      const allFiles: string[] = [];

      for (const dir of directories) {
        const files = await this.scanDirectory(dir);
        allFiles.push(...files);
        progress.filesScanned = allFiles.length;
        progressCallback(progress);
      }

      // Get all existing game IDs from database
      const existingGames = await dbAll<{ id: string }>(
        "SELECT id FROM games",
      );
      const existingIds = new Set(existingGames.map((g) => g.id));

      // Track which files exist
      const currentFileIds = new Set<string>();

      // Index files in batches
      progress.phase = "indexing";
      progressCallback(progress);

      const gamesToCreate: any[] = [];

      for (let i = 0; i < allFiles.length; i++) {
        const filePath = allFiles[i];
        const fileId = this.generateFileId(filePath);
        currentFileIds.add(fileId);

        progress.currentFile = filePath;

        // Skip if already in database
        if (existingIds.has(fileId)) {
          progress.filesSkipped++;
          progressCallback(progress);
          continue;
        }

        // Parse SGF file
        const metadata = SgfParser.parseFile(filePath);
        if (!metadata) {
          progress.filesSkipped++;
          progressCallback(progress);
          continue;
        }

        // Prepare game record
        gamesToCreate.push({
          id: fileId,
          playedAt: metadata.date ? this.parseDate(metadata.date) : new Date(),
          round: metadata.round || "",
          event: metadata.event || "",
          komi: metadata.komi || "",
          white: metadata.whitePlayer || "",
          black: metadata.blackPlayer || "",
          whiteRank: metadata.whiteRank || "",
          blackRank: metadata.blackRank || "",
          whiteWins: metadata.whiteWins ? 1 : 0,
          blackWins: metadata.blackWins ? 1 : 0,
          result: metadata.result || "",
          filePath: filePath,
        });

        // Batch insert when we reach batch size
        if (gamesToCreate.length >= this.BATCH_SIZE) {
          await this.insertGames(gamesToCreate);
          progress.filesIndexed += gamesToCreate.length;
          gamesToCreate.length = 0;
          progressCallback(progress);
        }
      }

      // Insert remaining games
      if (gamesToCreate.length > 0) {
        await this.insertGames(gamesToCreate);
        progress.filesIndexed += gamesToCreate.length;
        progressCallback(progress);
      }

      // Cleanup: Remove database entries for files that no longer exist
      progress.phase = "cleanup";
      progressCallback(progress);

      const idsToRemove = existingGames
        .filter((g) => !currentFileIds.has(g.id))
        .map((g) => g.id);

      if (idsToRemove.length > 0) {
        // Delete in batches
        for (let i = 0; i < idsToRemove.length; i += this.BATCH_SIZE) {
          const batch = idsToRemove.slice(i, i + this.BATCH_SIZE);
          const placeholders = batch.map(() => "?").join(",");
          await dbRun(
            `DELETE FROM games WHERE id IN (${placeholders})`,
            batch,
          );
        }
        progress.filesRemoved = idsToRemove.length;
      }

      // Complete
      progress.phase = "complete";
      delete progress.currentFile;
      progressCallback(progress);
    } catch (error) {
      progress.error = error instanceof Error ? error.message : "Unknown error";
      progressCallback(progress);
      throw error;
    }
  }

  /**
   * Insert multiple games into the database
   */
  private static async insertGames(games: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const stmt = db.prepare(`
          INSERT INTO games (id, playedAt, round, event, komi, white, black, whiteRank, blackRank, whiteWins, blackWins, result, filePath)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const game of games) {
          stmt.run(
            game.id,
            game.playedAt.toISOString(),
            game.round,
            game.event,
            game.komi,
            game.white,
            game.black,
            game.whiteRank,
            game.blackRank,
            game.whiteWins,
            game.blackWins,
            game.result,
            game.filePath,
          );
        }

        stmt.finalize((err) => {
          if (err) {
            db.run("ROLLBACK");
            reject(err);
          } else {
            db.run("COMMIT", (commitErr) => {
              if (commitErr) reject(commitErr);
              else resolve();
            });
          }
        });
      });
    });
  }

  /**
   * Parses a date string from SGF format
   * @param dateStr - Date string (e.g., "1941-06-21" or "1941-06")
   * @returns Date object
   */
  private static parseDate(dateStr: string): Date {
    try {
      // Try parsing ISO format first
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Handle partial dates (YYYY-MM or YYYY)
      const parts = dateStr.split("-");
      if (parts.length >= 1) {
        const year = parseInt(parts[0], 10);
        const month = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;
        const day = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
        return new Date(year, month, day);
      }

      // Fallback to current date
      return new Date();
    } catch {
      return new Date();
    }
  }
}
