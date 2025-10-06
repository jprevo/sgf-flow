import { Request, Response, Router } from "express";
import { SgfIndexerService } from "../services/sgf-indexer.service";
import { dbGet } from "../utils/database";

const router = Router();

/**
 * GET /api/sgf-indexer/index
 * Start indexing SGF files with Server-Sent Events progress updates
 */
router.get("/index", async (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  // Send initial connection message
  res.write('data: {"status":"connected"}\n\n');

  try {
    // Start indexing with progress callback
    await SgfIndexerService.indexAll((progress) => {
      // Send progress update as SSE
      const data = JSON.stringify(progress);
      res.write(`data: ${data}\n\n`);
    });

    // Close the connection
    res.end();
  } catch (error) {
    // Send error as SSE
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.write(
      `data: ${JSON.stringify({ error: errorMessage, phase: "error" })}\n\n`,
    );
    res.end();
  }
});

/**
 * GET /api/sgf-indexer/stats
 * Get current database statistics
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const totalGames = await dbGet<{ count: number }>(
      "SELECT COUNT(*) as count FROM games",
    );
    const gamesWithBlackWins = await dbGet<{ count: number }>(
      "SELECT COUNT(*) as count FROM games WHERE blackWins = 1",
    );
    const gamesWithWhiteWins = await dbGet<{ count: number }>(
      "SELECT COUNT(*) as count FROM games WHERE whiteWins = 1",
    );

    res.json({
      totalGames: totalGames?.count || 0,
      gamesWithBlackWins: gamesWithBlackWins?.count || 0,
      gamesWithWhiteWins: gamesWithWhiteWins?.count || 0,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/sgf-indexer/clear
 * Clear all games from the database
 */
router.delete("/clear", async (req: Request, res: Response) => {
  try {
    const { dbRun } = await import("../utils/database");
    const result = await dbRun("DELETE FROM games");

    res.json({
      message: "Database cleared successfully",
      deletedCount: result.changes || 0,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to clear database",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
