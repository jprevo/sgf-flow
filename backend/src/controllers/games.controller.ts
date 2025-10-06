import { Router, Request, Response } from "express";
import { getGames, type GameFilters } from "../services/games.service";

const router = Router();

/**
 * GET /api/games
 * Get games with optional filters and sorting
 * Query params:
 *   - query: string - search query
 *   - playerName: boolean - search in player names
 *   - gameName: boolean - search in game names (round + event)
 *   - year: boolean - search in year
 *   - sortBy: "white" | "black" | "event" | "date" - field to sort by
 *   - sortOrder: "asc" | "desc" - sort order
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      query = "",
      playerName = "true",
      gameName = "true",
      year = "true",
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    // Parse boolean query parameters
    const parseBoolean = (value: string | string[] | undefined): boolean => {
      if (typeof value === "string") {
        return value.toLowerCase() === "true";
      }
      return true; // default to true
    };

    const filters: GameFilters = {
      query: typeof query === "string" ? query : "",
      searchScope: {
        playerName: parseBoolean(playerName as string),
        gameName: parseBoolean(gameName as string),
        year: parseBoolean(year as string),
      },
      sortBy: (sortBy as "white" | "black" | "event" | "date") || "date",
      sortOrder: (sortOrder as "asc" | "desc") || "desc",
    };

    const result = await getGames(filters);

    res.json(result);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      error: "Failed to retrieve games",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
