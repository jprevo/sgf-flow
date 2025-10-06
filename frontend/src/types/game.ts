export interface Game {
  id: string;
  playerWhite: string;
  playerBlack: string;
  event: string;
  date: string;
  result: string;
  komi: number;
}

export interface GameDetail {
  id: string;
  playedAt: string;
  round: string;
  event: string;
  komi: string;
  white: string;
  black: string;
  whiteRank: string;
  blackRank: string;
  whiteWins: number;
  blackWins: number;
  result: string;
  filePath: string;
  viewed: boolean;
  createdAt: string;
  sgfContent: string;
}
