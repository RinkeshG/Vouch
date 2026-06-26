"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* Light + dark are both first-class. The choice lives on <html> (so the whole
   product flips at the root) and persists in localStorage. A tiny inline script
   in layout sets the class before paint, so there's no flash. */

type Theme = "light" | "dark";
const KEY = "hotlist:theme";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const fromDom = document.documentElement.classList.contains("themeDark");
    setTheme(fromDom ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("themeDark", theme === "dark");
    try { window.localStorage.setItem(KEY, theme); } catch { /* ignore */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#14100B" : "#FBF2E4");
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button type="button" className={className} onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Toggle theme">
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}

/* Run before paint to avoid a flash of the wrong theme. */
export const themeBootScript = `try{if(localStorage.getItem('${KEY}')==='dark')document.documentElement.classList.add('themeDark')}catch(e){}`;
