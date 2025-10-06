import { dbAll, dbGet } from "../utils/database";

export interface GameFilters {
  query?: string;
  searchScope?: {
    playerName?: boolean;
    gameName?: boolean;
    year?: boolean;
  };
  sortBy?: "white" | "black" | "event" | "date";
  sortOrder?: "asc" | "desc";
}

export interface GameListResponse {
  games: Array<{
    id: string;
    playerWhite: string;
    playerBlack: string;
    event: string;
    date: string;
    result: string;
    komi: string;
    round: string;
  }>;
  total: number;
  limit: number;
}

interface GameRow {
  id: string;
  white: string;
  black: string;
  event: string;
  playedAt: string;
  result: string;
  komi: string;
  round: string;
}

/**
 * Get games from the database with optional filters and sorting
 * @param filters - Search and filter options
 * @returns Games list with total count
 */
export async function getGames(
  filters: GameFilters = {},
): Promise<GameListResponse> {
  const {
    query = "",
    searchScope = { playerName: true, gameName: true, year: true },
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  const limit = 1000;

  // Build FTS5 search query and regular WHERE clause
  let gamesQuery: string;
  let countQuery: string;
  const params: any[] = [];

  if (query && query.trim() !== "") {
    // Build FTS5 search query based on search scope
    const ftsConditions: string[] = [];

    if (searchScope.playerName) {
      ftsConditions.push(`white:${query}*`, `black:${query}*`);
    }

    if (searchScope.gameName) {
      ftsConditions.push(`event:${query}*`, `round:${query}*`);
    }

    // Year search - check if it's a 4-digit year
    const yearMatch = query.match(/^\d{4}$/);

    if (yearMatch && searchScope.year) {
      const year = yearMatch[0];
      // Use regular WHERE clause for year filtering on playedAt
      gamesQuery = `
        SELECT g.id, g.white, g.black, g.event, g.playedAt, g.result, g.komi, g.round
        FROM games g
        WHERE strftime('%Y', g.playedAt) = ?
        ORDER BY ${getSortColumn(sortBy)} ${sortOrder.toUpperCase()}
        LIMIT ?
      `;

      countQuery = `
        SELECT COUNT(*) as count
        FROM games g
        WHERE strftime('%Y', g.playedAt) = ?
      `;

      params.push(year, limit);
    } else if (ftsConditions.length > 0) {
      // Use FTS5 full-text search
      const ftsQuery = ftsConditions.join(" OR ");

      gamesQuery = `
        SELECT g.id, g.white, g.black, g.event, g.playedAt, g.result, g.komi, g.round
        FROM games g
        INNER JOIN games_fts fts ON g.rowid = fts.rowid
        WHERE games_fts MATCH ?
        ORDER BY ${getSortColumn(sortBy)} ${sortOrder.toUpperCase()}
        LIMIT ?
      `;

      countQuery = `
        SELECT COUNT(*) as count
        FROM games g
        INNER JOIN games_fts fts ON g.rowid = fts.rowid
        WHERE games_fts MATCH ?
      `;

      params.push(ftsQuery, limit);
    } else {
      // No valid search conditions, return all games
      gamesQuery = `
        SELECT id, white, black, event, playedAt, result, komi, round
        FROM games g
        ORDER BY ${getSortColumn(sortBy)} ${sortOrder.toUpperCase()}
        LIMIT ?
      `;

      countQuery = `SELECT COUNT(*) as count FROM games`;
      params.push(limit);
    }
  } else {
    // No query, return all games
    gamesQuery = `
      SELECT id, white, black, event, playedAt, result, komi, round
      FROM games g
      ORDER BY ${getSortColumn(sortBy)} ${sortOrder.toUpperCase()}
      LIMIT ?
    `;

    countQuery = `SELECT COUNT(*) as count FROM games`;
    params.push(limit);
  }

  // Execute queries
  const [games, countResult] = await Promise.all([
    dbAll<GameRow>(gamesQuery, params),
    dbGet<{ count: number }>(countQuery, params.slice(0, -1)), // Remove limit from count query
  ]);

  // Transform to match frontend interface
  const transformedGames = games.map((game) => ({
    id: game.id,
    playerWhite: game.white,
    playerBlack: game.black,
    event: game.event,
    date: game.playedAt.split("T")[0], // Format as YYYY-MM-DD
    result: game.result,
    komi: game.komi,
    round: game.round,
  }));

  return {
    games: transformedGames,
    total: countResult?.count || 0,
    limit,
  };
}

/**
 * Helper function to get sort column name from sortBy value
 */
function getSortColumn(sortBy: string): string {
  switch (sortBy) {
    case "white":
      return "g.white";
    case "black":
      return "g.black";
    case "event":
      return "g.event";
    case "date":
    default:
      return "g.playedAt";
  }
}
