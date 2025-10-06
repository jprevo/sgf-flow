import { signal, effect } from "@preact/signals-react";

export type Theme = "light" | "dark";

const THEME_KEY = "sgf-flow-theme";

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const theme = signal<Theme>(getInitialTheme());

effect(() => {
  localStorage.setItem(THEME_KEY, theme.value);
  document.documentElement.setAttribute("data-theme", theme.value);
});

export const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};
