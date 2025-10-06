import { signal } from "@preact/signals-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { SearchBox } from "./SearchBox";
import { SgfDirectoriesModal } from "./SgfDirectoriesModal";
import { SidebarLayout } from "./SidebarLayout";
import {
  searchFilters,
  toggleFilter,
  updateSearchQuery,
} from "../stores/searchStore";

const isIndexModalOpen = signal(false);

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <SidebarLayout>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {t("search.title")}
        </h2>
        <SearchBox
          placeholder={t("search.placeholder")}
          value={searchFilters.value.query}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
        <div className="space-y-2 pl-1">
          <Checkbox
            label={t("search.playerName")}
            checked={searchFilters.value.playerName}
            onChange={() => toggleFilter("playerName")}
          />
          <Checkbox
            label={t("search.gameName")}
            checked={searchFilters.value.gameName}
            onChange={() => toggleFilter("gameName")}
          />
          <Checkbox
            label={t("search.year")}
            checked={searchFilters.value.year}
            onChange={() => toggleFilter("year")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => (isIndexModalOpen.value = true)}
        >
          {t("indexer.indexButton")}
        </Button>
        <Button variant="primary" className="w-full">
          {t("indexer.autoplayAll")}
        </Button>
      </div>

      <SgfDirectoriesModal
        isOpen={isIndexModalOpen.value}
        onClose={() => (isIndexModalOpen.value = false)}
      />
    </SidebarLayout>
  );
}
