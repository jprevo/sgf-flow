import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface GameControlsProps {
  currentMove: number;
  totalMoves: number;
  onMoveChange: (moveIndex: number) => void;
}

export function GameControls({
  currentMove,
  totalMoves,
  onMoveChange,
}: GameControlsProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const animateJump = (targetMove: number) => {
    if (animationRef.current !== null) {
      clearInterval(animationRef.current);
    }

    const start = currentMove;
    const distance = targetMove - start;
    const steps = Math.abs(distance);

    if (steps <= 1) {
      onMoveChange(targetMove);
      return;
    }

    const direction = distance > 0 ? 1 : -1;
    let step = 0;

    animationRef.current = window.setInterval(() => {
      step++;
      if (step >= steps) {
        onMoveChange(targetMove);
        if (animationRef.current !== null) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      } else {
        onMoveChange(start + step * direction);
      }
    }, 50);
  };

  const goToStart = () => onMoveChange(0);
  const goToPrevious = () => onMoveChange(Math.max(0, currentMove - 1));
  const goBackFifteen = () => animateJump(Math.max(0, currentMove - 15));
  const goToNext = () => onMoveChange(Math.min(totalMoves, currentMove + 1));
  const goForwardFifteen = () => animateJump(Math.min(totalMoves, currentMove + 15));
  const goToEnd = () => onMoveChange(totalMoves);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        onMoveChange((prev) => {
          if (prev >= totalMoves) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed * 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current !== null) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalMoves, onMoveChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {t("controls.title")}
      </h2>

      <div className="grid grid-cols-6 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToStart}
          disabled={currentMove === 0}
          title={t("controls.start")}
        >
          ⏮
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackFifteen}
          disabled={currentMove === 0}
          title={t("controls.backFifteen")}
        >
          -15
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          disabled={currentMove === 0}
          title={t("controls.previous")}
        >
          ◀
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentMove >= totalMoves}
          title={t("controls.next")}
        >
          ▶
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goForwardFifteen}
          disabled={currentMove >= totalMoves}
          title={t("controls.forwardFifteen")}
        >
          +15
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToEnd}
          disabled={currentMove >= totalMoves}
          title={t("controls.end")}
        >
          ⏭
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="speed"
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) =>
            setPlaybackSpeed(Math.max(0.1, parseFloat(e.target.value) || 1))
          }
          className="
            w-16 px-2 py-1 text-sm rounded
            bg-[var(--color-input-bg)]
            border border-[var(--color-border)]
            text-[var(--color-text-primary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]
          "
          title={t("controls.speed")}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={togglePlay}
          className="flex-1"
        >
          {isPlaying ? `⏸ ${t("controls.pause")}` : `▶ ${t("controls.play")}`}
        </Button>
      </div>

      <div className="text-center text-sm text-[var(--color-text-secondary)]">
        {t("controls.moveCounter", { current: currentMove, total: totalMoves })}
      </div>
    </div>
  );
}
