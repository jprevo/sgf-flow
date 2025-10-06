import { Router, Request, Response } from "express";
import { SgfIndexerService } from "../services/sgf-indexer.service";

const router = Router();

/**
 * POST /api/sgf-indexer/index
 * Start indexing SGF files with Server-Sent Events progress updates
 */
router.post("/index", async (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

  // Send initial connection message
  res.write("data: {\"status\":\"connected\"}\n\n");

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
    const { prisma } = await import("../utils/database");

    const totalGames = await prisma.game.count();
    const gamesWithBlackWins = await prisma.game.count({
      where: { blackWins: true },
    });
    const gamesWithWhiteWins = await prisma.game.count({
      where: { whiteWins: true },
    });

    res.json({
      totalGames,
      gamesWithBlackWins,
      gamesWithWhiteWins,
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
    const { prisma } = await import("../utils/database");

    const result = await prisma.game.deleteMany({});

    res.json({
      message: "Database cleared successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to clear database",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
