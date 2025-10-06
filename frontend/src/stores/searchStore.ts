import { signal } from "@preact/signals-react";

export interface SearchFilters {
  query: string;
  playerName: boolean;
  gameName: boolean;
  year: boolean;
}

export const searchFilters = signal<SearchFilters>({
  query: "",
  playerName: true,
  gameName: true,
  year: true,
});

export const updateSearchQuery = (query: string) => {
  searchFilters.value = { ...searchFilters.value, query };
};

export const toggleFilter = (filter: keyof Omit<SearchFilters, "query">) => {
  searchFilters.value = {
    ...searchFilters.value,
    [filter]: !searchFilters.value[filter],
  };
};
