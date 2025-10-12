import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { GameControls } from "./GameControls";
import { GameInfo } from "./GameInfo";
import { SidebarLayout } from "./SidebarLayout";

interface GameSidebarProps {
  currentMove: number;
  totalMoves: number;
  onMoveChange: (moveIndex: number) => void;
  gameData: Record<string, string[] | undefined>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export function GameSidebar({
  currentMove,
  totalMoves,
  onMoveChange,
  gameData,
  isCollapsed,
  onToggleCollapse,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
}: GameSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex-1 justify-start"
        >
          ← {t("navigation.backToGames")}
        </Button>
        <button
          onClick={onToggleCollapse}
          className="
            w-8 h-8
            flex items-center justify-center
            rounded
            hover:bg-[var(--color-bg-primary)]
            transition-colors
          "
          aria-label="Close sidebar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-text-primary)]"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <GameControls
        currentMove={currentMove}
        totalMoves={totalMoves}
        onMoveChange={onMoveChange}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
      />

      <div className="border-t border-[var(--color-border)] pt-4">
        <GameInfo gameData={gameData} />
      </div>
    </SidebarLayout>
  );
}
