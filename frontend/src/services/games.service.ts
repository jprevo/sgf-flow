import { httpClient } from "./http.service";
import type { Game } from "../types/game";

export interface GameListResponse {
  games: Game[];
  total: number;
  limit: number;
}

export interface GameQueryParams {
  query?: string;
  playerName?: boolean;
  gameName?: boolean;
  year?: boolean;
  sortBy?: "white" | "black" | "event" | "date";
  sortOrder?: "asc" | "desc";
}

/**
 * Fetch games from the API with optional filters and sorting
 */
export async function fetchGames(
  params: GameQueryParams = {},
): Promise<GameListResponse> {
  const queryParams = new URLSearchParams();

  if (params.query) {
    queryParams.append("query", params.query);
  }

  if (params.playerName !== undefined) {
    queryParams.append("playerName", String(params.playerName));
  }

  if (params.gameName !== undefined) {
    queryParams.append("gameName", String(params.gameName));
  }

  if (params.year !== undefined) {
    queryParams.append("year", String(params.year));
  }

  if (params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    queryParams.append("sortOrder", params.sortOrder);
  }

  const response = await httpClient.get<GameListResponse>(
    `/games?${queryParams.toString()}`,
  );

  return response.data;
}
