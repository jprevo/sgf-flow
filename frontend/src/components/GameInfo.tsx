interface GameInfoProps {
  gameData: Record<string, string[] | undefined>;
}

interface InfoItem {
  label: string;
  key: string;
}

const INFO_ITEMS: InfoItem[] = [
  { label: "Event", key: "EV" },
  { label: "Round", key: "RO" },
  { label: "Date", key: "DT" },
  { label: "Place", key: "PC" },
  { label: "Black", key: "PB" },
  { label: "Black Rank", key: "BR" },
  { label: "White", key: "PW" },
  { label: "White Rank", key: "WR" },
  { label: "Result", key: "RE" },
  { label: "Komi", key: "KM" },
  { label: "Rules", key: "RU" },
  { label: "Time", key: "TM" },
  { label: "Overtime", key: "OT" },
  { label: "Game Name", key: "GN" },
  { label: "Opening", key: "ON" },
  { label: "Annotator", key: "AN" },
  { label: "Source", key: "SO" },
  { label: "Copyright", key: "CP" },
];

export function GameInfo({ gameData }: GameInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        Game Information
      </h2>

      <div className="space-y-2">
        {INFO_ITEMS.map(({ label, key }) => {
          const value = gameData[key]?.[0];
          if (!value) return null;

          return (
            <div key={key} className="space-y-1">
              <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                {label}
              </dt>
              <dd className="text-sm text-[var(--color-text-primary)]">
                {value}
              </dd>
            </div>
          );
        })}

        {gameData.GC?.[0] && (
          <div className="space-y-1 pt-2 border-t border-[var(--color-border)]">
            <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Game Comment
            </dt>
            <dd className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
              {gameData.GC[0]}
            </dd>
          </div>
        )}
      </div>
    </div>
  );
}
