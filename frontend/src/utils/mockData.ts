import type { Game } from "../types/game.ts";

const players = [
  "Lee Sedol",
  "Cho Chikun",
  "Takemiya Masaki",
  "Kobayashi Koichi",
  "Fujisawa Shuko",
  "Sakata Eio",
  "Ishida Yoshio",
  "Otake Hideo",
  "Kato Masao",
  "Rin Kaiho",
  "AlphaGo",
  "Ke Jie",
  "Park Junghwan",
  "Shin Jinseo",
  "Gu Li",
];

const events = [
  "Kisei Tournament",
  "Meijin Tournament",
  "Honinbo Tournament",
  "Judan Tournament",
  "Tengen Tournament",
  "Oza Tournament",
  "Gosei Tournament",
  "LG Cup",
  "Samsung Cup",
  "Fujitsu Cup",
];

const results = [
  "B+R",
  "W+R",
  "B+0.5",
  "W+1.5",
  "B+2.5",
  "W+3.5",
  "B+5.5",
  "W+7.5",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(): string {
  const year = 1990 + Math.floor(Math.random() * 35);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateMockGames(count: number): Game[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `game-${i + 1}`,
    playerWhite: randomItem(players),
    playerBlack: randomItem(players),
    event: randomItem(events),
    date: randomDate(),
    result: randomItem(results),
    komi: 6.5,
  }));
}
