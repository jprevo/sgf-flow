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
}

export function GameSidebar({
  currentMove,
  totalMoves,
  onMoveChange,
  gameData,
}: GameSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="w-full justify-start"
      >
        ← {t("navigation.backToGames")}
      </Button>

      <GameControls
        currentMove={currentMove}
        totalMoves={totalMoves}
        onMoveChange={onMoveChange}
      />

      <div className="border-t border-[var(--color-border)] pt-4">
        <GameInfo gameData={gameData} />
      </div>
    </SidebarLayout>
  );
}
