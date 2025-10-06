import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { BoundedGoban } from "@sabaki/shudan";
import { fetchGameById } from "../services/games.service";
import type { GameDetail } from "../types/game";
import { MoveType, type ParsedSgf, SgfParser } from "../services/sgf-parser.service.ts";
import GoBoard, { type Sign, type Vertex } from "@sabaki/go-board";
import { GameSidebar } from "../components/GameSidebar";
import type { Marker } from "@sabaki/shudan/src/Goban";

export function GamePage() {
  const { id } = useParams<{ id: string }>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedSgf, setParsedSgf] = useState<ParsedSgf | null>(null);
  const [signMap, setSignMap] = useState<Sign[][]>([]);
  const [markerMap, setMarkerMap] = useState<Marker[][]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

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
    const updateDimensions = () => {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial size detection
    updateDimensions();

    // Update on window resize
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)]">
        <p className="text-[var(--color-text-secondary)]">Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)]">
        <p className="text-[var(--color-text-secondary)]">Game not found</p>
      </div>
    );
  }

  return (
    <>
      <GameSidebar
        currentMove={currentMoveIndex}
        totalMoves={parsedSgf?.moves.length || 0}
        onMoveChange={setCurrentMoveIndex}
        gameData={parsedSgf?.source.data || {}}
      />
      <div ref={wrapperRef} className="flex-1 flex items-center justify-center">
        {/*
         // @ts-ignore */}
        <BoundedGoban
          maxWidth={dimensions.width}
          maxHeight={dimensions.height}
          signMap={signMap}
          markerMap={markerMap}
        />
      </div>
    </>
  );
}
