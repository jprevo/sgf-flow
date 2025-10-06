import { List, type RowComponentProps } from "react-window";
import { useEffect, useState } from "react";
import { useSignalEffect } from "@preact/signals-react/runtime";
import type { Game } from "../types/game.ts";
import { fetchGames } from "../services/games.service";
import { searchFilters } from "../stores/searchStore";

function GameRow({
  index,
  style,
  data,
}: RowComponentProps<{
  data: Game[];
}>) {
  const game = data[index];

  return (
    <div
      style={style}
      className="
        px-4 flex items-center gap-4
        border-b border-[var(--color-border)]
        hover:bg-[var(--color-bg-tertiary)]
        transition-colors cursor-pointer
      "
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {game.playerWhite} vs {game.playerBlack}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <span className="truncate">{game.event}</span>
          <span>•</span>
          <span>{game.date}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`
            px-2 py-1 rounded text-xs font-medium
            ${
              game.result.startsWith("B+")
                ? "bg-[var(--color-accent-green)] text-white"
                : "bg-[var(--color-accent-brown)] text-white"
            }
          `}
        >
          {game.result}
        </span>
      </div>
    </div>
  );
}

export function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch games whenever search filters change
  useSignalEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      try {
        const filters = searchFilters.value;
        const result = await fetchGames({
          query: filters.query,
          playerName: filters.playerName,
          gameName: filters.gameName,
          year: filters.year,
          sortBy: "date",
          sortOrder: "desc",
        });

        setGames(result.games);
        setTotal(result.total);
        setLimit(result.limit);
      } catch (error) {
        console.error("Failed to load games:", error);
        setGames([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  });

  const displayCount =
    total > limit
      ? `${total.toLocaleString()} (displaying ${limit})`
      : total.toLocaleString();

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Games: {isLoading ? "Loading..." : displayCount}
        </h2>
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">Loading games...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">No games found</p>
        </div>
      ) : (
        <List
          rowCount={games.length}
          rowHeight={64}
          rowProps={{ data: games }}
          rowComponent={GameRow}
        />
      )}
    </div>
  );
}
