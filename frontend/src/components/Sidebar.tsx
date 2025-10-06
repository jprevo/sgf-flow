import { signal } from "@preact/signals-react";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";
import { Modal } from "./Modal";
import { searchFilters, updateSearchQuery, toggleFilter } from "../stores/searchStore";

const isIndexModalOpen = signal(false);

export function Sidebar() {
  return (
    <div
      className="
        w-80 h-full flex flex-col
        bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg-secondary)]
        border-r border-[var(--color-border)] dark:border-[var(--color-dark-border)]
        shadow-lg
      "
    >
      <div className="p-4 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
          SGF Flow
        </h1>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
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
            <Checkbox
              label="Wins only"
              checked={searchFilters.value.winsOnly}
              onChange={() => toggleFilter("winsOnly")}
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
      </div>

      <Modal
        isOpen={isIndexModalOpen.value}
        onClose={() => (isIndexModalOpen.value = false)}
        title="Index SGF Files"
      >
        <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          Coming soon...
        </p>
      </Modal>
    </div>
  );
}
