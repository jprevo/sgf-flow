import { List, type RowComponentProps } from "react-window";
import { generateMockGames } from "../utils/mockData";
import { useMemo } from "react";
import type { Game } from "../types/game.ts";

const mockGames = generateMockGames(1000);

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
  const itemData = useMemo(() => mockGames, []);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Games ({itemData.length})
        </h2>
      </div>
      <List
        rowCount={itemData.length}
        rowHeight={64}
        rowProps={{ data: itemData }}
        rowComponent={GameRow}
      />
    </div>
  );
}
