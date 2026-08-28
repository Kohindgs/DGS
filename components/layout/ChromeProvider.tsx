"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ChromeContextValue = {
  menuOpen: boolean;
  letsTalkOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  openLetsTalk: () => void;
  closeLetsTalk: () => void;
};

const ChromeContext = createContext<ChromeContextValue | null>(null);

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [letsTalkOpen, setLetsTalkOpen] = useState(false);

  const openMenu = useCallback(() => {
    setLetsTalkOpen(false);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggleMenu = useCallback(() => {
    setLetsTalkOpen(false);
    setMenuOpen((value) => !value);
  }, []);

  const openLetsTalk = useCallback(() => {
    setMenuOpen(false);
    setLetsTalkOpen(true);
  }, []);

  const closeLetsTalk = useCallback(() => setLetsTalkOpen(false), []);

  const value = useMemo(
    () => ({
      menuOpen,
      letsTalkOpen,
      openMenu,
      closeMenu,
      toggleMenu,
      openLetsTalk,
      closeLetsTalk,
    }),
    [menuOpen, letsTalkOpen, openMenu, closeMenu, toggleMenu, openLetsTalk, closeLetsTalk],
  );

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  const context = useContext(ChromeContext);
  if (!context) throw new Error("useChrome must be used within ChromeProvider");
  return context;
}
