import { prisma } from "../utils/database";
import { Prisma } from "@prisma/client";

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

  // Build the WHERE clause based on search query and scope
  let whereClause: Prisma.GameWhereInput = {};

  if (query && query.trim() !== "") {
    const searchConditions: Prisma.GameWhereInput[] = [];

    // Player name search (white or black)
    if (searchScope.playerName) {
      searchConditions.push({
        OR: [{ white: { contains: query } }, { black: { contains: query } }],
      });
    }

    // Game name search (round + event)
    if (searchScope.gameName) {
      searchConditions.push({
        OR: [{ round: { contains: query } }, { event: { contains: query } }],
      });
    }

    // Year search (extract year from playedAt date)
    if (searchScope.year) {
      // Try to parse as year (4 digits)
      const yearMatch = query.match(/^\d{4}$/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        searchConditions.push({
          playedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        });
      }
    }

    // Combine all search conditions with OR
    if (searchConditions.length > 0) {
      whereClause = {
        OR: searchConditions.flatMap((condition) =>
          condition.OR ? condition.OR : [condition],
        ),
      };
    }
  }

  // Build the ORDER BY clause
  const orderByClause: Prisma.GameOrderByWithRelationInput = (() => {
    switch (sortBy) {
      case "white":
        return { white: sortOrder };
      case "black":
        return { black: sortOrder };
      case "event":
        return { event: sortOrder };
      case "date":
      default:
        return { playedAt: sortOrder };
    }
  })();

  // Execute queries
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit,
      select: {
        id: true,
        white: true,
        black: true,
        event: true,
        playedAt: true,
        result: true,
        komi: true,
        round: true,
      },
    }),
    prisma.game.count({
      where: whereClause,
    }),
  ]);

  // Transform to match frontend interface
  const transformedGames = games.map((game) => ({
    id: game.id,
    playerWhite: game.white,
    playerBlack: game.black,
    event: game.event,
    date: game.playedAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    result: game.result,
    komi: game.komi,
    round: game.round,
  }));

  return {
    games: transformedGames,
    total,
    limit,
  };
}
