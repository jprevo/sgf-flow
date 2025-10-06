import { signal } from "@preact/signals-react";
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
  return (
    <SidebarLayout>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          Search
        </h2>
        <SearchBox
          placeholder="Search games..."
          value={searchFilters.value.query}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
        <div className="space-y-2 pl-1">
          <Checkbox
            label="Player name"
            checked={searchFilters.value.playerName}
            onChange={() => toggleFilter("playerName")}
          />
          <Checkbox
            label="Game name"
            checked={searchFilters.value.gameName}
            onChange={() => toggleFilter("gameName")}
          />
          <Checkbox
            label="Year"
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
          Index SGFs
        </Button>
        <Button variant="primary" className="w-full">
          Autoplay All
        </Button>
      </div>

      <SgfDirectoriesModal
        isOpen={isIndexModalOpen.value}
        onClose={() => (isIndexModalOpen.value = false)}
      />
    </SidebarLayout>
  );
}
