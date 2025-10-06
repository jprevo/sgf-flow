// @ts-ignore
import sgf from "@sabaki/sgf";
import type { Vertex } from "@sabaki/go-board";

export enum MoveType {
  White = "w",
  Black = "b",
  Remove = "r",
}

export class Move {
  x: number = -1;
  y: number = -1;
  color: MoveType | undefined;
  labels: Label[] = [];
  symbols: Symbol[] = [];

  vertex(): Vertex {
    return [this.x, this.y];
  }
}

export interface Label {
  x: number;
  y: number;
  text: string;
}

export interface Symbol {
  x: number;
  y: number;
  kind: SymbolKind;
}

export enum SymbolKind {
  Square,
  Circle,
  Triangle,
}

export interface ParsedSgf {
  size: number;
  moves: Move[];
}

const SymbolMapping: SymbolMappingType = {
  TR: SymbolKind.Triangle,
  SQ: SymbolKind.Square,
  CR: SymbolKind.Circle,
};

type SymbolMappingType = {
  [key: string]: SymbolKind;
};

export class SgfParser {
  public static load(sgfData: string): ParsedSgf {
    let game = sgf.parse(sgfData);

    const entry = game[0];
    const moves: Move[] = [];
    const size = entry.data.SZ ? entry.data.SZ[0] : 19;

    SgfParser.iterate(moves, entry);

    return {
      size: parseInt(size, 10),
      moves,
    };
  }

  private static iterate(moves: Move[], token: any) {
    if (!token) {
      return;
    }

    for (const color of ["B", "W", "AB", "AW", "AE"]) {
      if (token.data && token.data[color]) {
        for (const vertex of token.data[color]) {
          const position = sgf.parseVertex(vertex);

          const move = new Move();
          move.x = position[0];
          move.y = position[1];
          move.color = MoveType.Black;

          if (color === "W" || color === "AW") {
            move.color = MoveType.White;
          }

          if (color === "AE") {
            move.color = MoveType.Remove;
          }

          if (Array.isArray(token.data["LB"])) {
            for (const tokenLabel of token.data["LB"]) {
              const [labelVertex, labelText] = tokenLabel.split(":");
              const labelPosition = sgf.parseVertex(labelVertex);

              move.labels.push({
                x: labelPosition[0],
                y: labelPosition[1],
                text: labelText,
              });
            }
          }

          for (const symbolKey of Object.keys(SymbolMapping)) {
            if (Array.isArray(token.data[symbolKey])) {
              for (const vertex of token.data[symbolKey]) {
                const symbolPosition = sgf.parseVertex(vertex);

                move.symbols.push({
                  x: symbolPosition[0],
                  y: symbolPosition[1],
                  kind: SymbolMapping[symbolKey],
                });
              }
            }
          }

          moves.push(move);
        }
      }
    }

    if (token.children) {
      SgfParser.iterate(moves, token.children[0]);
    }
  }
}
