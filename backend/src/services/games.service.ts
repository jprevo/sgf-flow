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

  // Build WHERE clause
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (query && query.trim() !== "") {
    const searchConditions: string[] = [];

    // Player name search (white or black)
    if (searchScope.playerName) {
      searchConditions.push("white LIKE ?", "black LIKE ?");
      params.push(`%${query}%`, `%${query}%`);
    }

    // Game name search (round + event)
    if (searchScope.gameName) {
      searchConditions.push("round LIKE ?", "event LIKE ?");
      params.push(`%${query}%`, `%${query}%`);
    }

    // Year search (extract year from playedAt date)
    if (searchScope.year) {
      const yearMatch = query.match(/^\d{4}$/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        searchConditions.push(
          "strftime('%Y', playedAt) = ?",
        );
        params.push(year.toString());
      }
    }

    if (searchConditions.length > 0) {
      whereClauses.push(`(${searchConditions.join(" OR ")})`);
    }
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Build ORDER BY clause
  let orderByColumn: string;
  switch (sortBy) {
    case "white":
      orderByColumn = "white";
      break;
    case "black":
      orderByColumn = "black";
      break;
    case "event":
      orderByColumn = "event";
      break;
    case "date":
    default:
      orderByColumn = "playedAt";
      break;
  }

  const orderByClause = `ORDER BY ${orderByColumn} ${sortOrder.toUpperCase()}`;

  // Execute queries
  const gamesQuery = `
    SELECT id, white, black, event, playedAt, result, komi, round
    FROM games
    ${whereClause}
    ${orderByClause}
    LIMIT ?
  `;

  const countQuery = `
    SELECT COUNT(*) as count
    FROM games
    ${whereClause}
  `;

  const [games, countResult] = await Promise.all([
    dbAll<GameRow>(gamesQuery, [...params, limit]),
    dbGet<{ count: number }>(countQuery, params),
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
