import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BoundedGoban } from "@sabaki/shudan";
import { fetchGameById } from "../services/games.service";
import type { GameDetail } from "../types/game";
import { MoveType, type ParsedSgf, SgfParser } from "../services/sgf-parser.service.ts";
import GoBoard, { type Sign, type Vertex } from "@sabaki/go-board";
import { GameSidebar } from "../components/GameSidebar";
import type { Marker } from "@sabaki/shudan/src/Goban";

export function GamePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedSgf, setParsedSgf] = useState<ParsedSgf | null>(null);
  const [signMap, setSignMap] = useState<Sign[][]>([]);
  const [markerMap, setMarkerMap] = useState<Marker[][]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [whiteCaptures, setWhiteCaptures] = useState(0);
  const [blackCaptures, setBlackCaptures] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const updateDimensions = () => {
    if (wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  };

  useEffect(() => {
    if (parsedSgf) {
      let board = GoBoard.fromDimensions(parsedSgf.size);
      let lastVertex: Vertex | null = null;

      for (let i = 0; i < currentMoveIndex; i++) {
        const move = parsedSgf.moves[i];
        if (move.color === MoveType.Remove) {
          board.set(move.vertex(), 0);
        } else {
          let sign: Sign = move.color === MoveType.White ? -1 : 1;
          const vertex = move.vertex();
          board = board.makeMove(sign, vertex);
          lastVertex = vertex;
        }
      }

      const whiteCaptured = board.getCaptures(-1);
      const blackCaptured = board.getCaptures(1);

      setWhiteCaptures(whiteCaptured);
      setBlackCaptures(blackCaptured);
      setSignMap(board.signMap);

      const markers: Marker[][] = [];

      if (lastVertex) {
        markers[lastVertex[1]] = [];
        markers[lastVertex[1]][lastVertex[0]] = { type: "circle" };
      }

      setMarkerMap(markers);
    }
  }, [parsedSgf, currentMoveIndex]);

  useEffect(() => {
    updateDimensions();
  }, [parsedSgf]);

  useEffect(() => {
    if (game) {
      const parsed = SgfParser.load(game.sgfContent);
      setParsedSgf(parsed);
    }
  }, [game]);

  // Load game data
  useEffect(() => {
    if (!id) return;

    const loadGame = async () => {
      try {
        setLoading(true);
        const gameData = await fetchGameById(id);
        setGame(gameData);
      } catch (error) {
        console.error("Failed to load game:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  // Update dimensions on resize
  useEffect(() => {
    // Update on window resize
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Handle autoplay
  useEffect(() => {
    if (isPlaying && parsedSgf) {
      intervalRef.current = window.setInterval(() => {
        setCurrentMoveIndex((current) => {
          if (current >= (parsedSgf.moves.length || 0)) {
            setIsPlaying(false);
            return current;
          }
          return current + 1;
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
    };
  }, [isPlaying, playbackSpeed, parsedSgf]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)]">
        <p className="text-[var(--color-text-secondary)]">
          {t("gamePage.loadingGame")}
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)]">
        <p className="text-[var(--color-text-secondary)]">
          {t("gamePage.gameNotFound")}
        </p>
      </div>
    );
  }

  const whitePlayer: string =
    parsedSgf?.source.data.PW?.[0] || t("gamePage.whitePlayer");
  const blackPlayer: string =
    parsedSgf?.source.data.PB?.[0] || t("gamePage.blackPlayer");

  const whiteRank = parsedSgf?.source.data.WR?.[0] ?? "";
  const blackRank = parsedSgf?.source.data.BR?.[0] ?? "";

  return (
    <>
      {!isSidebarCollapsed && (
        <GameSidebar
          currentMove={currentMoveIndex}
          totalMoves={parsedSgf?.moves.length || 0}
          onMoveChange={setCurrentMoveIndex}
          gameData={parsedSgf?.source.data || {}}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
        />
      )}

      {/* Toggle button when sidebar is collapsed */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="
            fixed top-4 left-4 z-50
            w-10 h-10
            bg-[var(--color-bg-secondary)]
            border border-[var(--color-border)]
            rounded-lg
            flex items-center justify-center
            shadow-lg
            hover:bg-[var(--color-bg-primary)]
            transition-all duration-300 ease-in-out
            animate-[fadeIn_0.3s_ease-in-out]
          "
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          aria-label="Open sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-text-primary)]"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <div
        ref={wrapperRef}
        className="flex-1 flex items-center justify-center relative m-5"
      >
        <div className="flex-0 select-none pointer-events-none me-5">
          <div
            className="text-6xl font-bold text-[var(--color-text-primary)] opacity-30"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
            }}
          >
            {whitePlayer.trim()} <span className="opacity-50">{whiteRank}</span>
            <div className="text-sm font-normal ms-1">
              {t("gamePage.whitePlayer")} •{" "}
              {t("gamePage.captures", { count: whiteCaptures })}
            </div>
          </div>
        </div>

        {/*
         // @ts-ignore */}
        <BoundedGoban
          maxWidth={dimensions.width}
          maxHeight={dimensions.height}
          signMap={signMap}
          markerMap={markerMap}
        />

        <div className="flex-0 select-none pointer-events-none ms-5">
          <div
            className="text-6xl font-bold text-[var(--color-text-primary)] opacity-30"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {blackPlayer.trim()} <span className="opacity-50">{blackRank}</span>
            <div className="text-sm font-normal ms-1">
              {t("gamePage.blackPlayer")} •{" "}
              {t("gamePage.captures", { count: blackCaptures })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
