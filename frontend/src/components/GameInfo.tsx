import { useTranslation } from "react-i18next";

interface GameInfoProps {
  gameData: Record<string, string[] | undefined>;
}

interface InfoItem {
  translationKey: string;
  key: string;
}

const INFO_ITEMS: InfoItem[] = [
  { translationKey: "gameInfo.event", key: "EV" },
  { translationKey: "gameInfo.round", key: "RO" },
  { translationKey: "gameInfo.date", key: "DT" },
  { translationKey: "gameInfo.place", key: "PC" },
  { translationKey: "gameInfo.black", key: "PB" },
  { translationKey: "gameInfo.blackRank", key: "BR" },
  { translationKey: "gameInfo.white", key: "PW" },
  { translationKey: "gameInfo.whiteRank", key: "WR" },
  { translationKey: "gameInfo.result", key: "RE" },
  { translationKey: "gameInfo.komi", key: "KM" },
  { translationKey: "gameInfo.rules", key: "RU" },
  { translationKey: "gameInfo.time", key: "TM" },
  { translationKey: "gameInfo.overtime", key: "OT" },
  { translationKey: "gameInfo.gameName", key: "GN" },
  { translationKey: "gameInfo.opening", key: "ON" },
  { translationKey: "gameInfo.annotator", key: "AN" },
  { translationKey: "gameInfo.source", key: "SO" },
  { translationKey: "gameInfo.copyright", key: "CP" },
];

export function GameInfo({ gameData }: GameInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {t("gameInfo.title")}
      </h2>

      <div className="space-y-2">
        {INFO_ITEMS.map(({ translationKey, key }) => {
          const value = gameData[key]?.[0];
          if (!value) return null;

          return (
            <div key={key} className="space-y-1">
              <dt className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                {t(translationKey)}
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
              {t("gameInfo.gameComment")}
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
