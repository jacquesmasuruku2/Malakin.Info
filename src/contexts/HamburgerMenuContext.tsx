'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HamburgerMenuContextType {
  isHamburgerOpen: boolean;
  openHamburger: () => void;
  closeHamburger: () => void;
  toggleHamburger: () => void;
}

const HamburgerMenuContext = createContext<HamburgerMenuContextType | undefined>(undefined);

export function HamburgerMenuProvider({ children }: { children: ReactNode }) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const openHamburger = () => setIsHamburgerOpen(true);
  const closeHamburger = () => setIsHamburgerOpen(false);
  const toggleHamburger = () => setIsHamburgerOpen((prev) => !prev);

  return (
    <HamburgerMenuContext.Provider value={{ isHamburgerOpen, openHamburger, closeHamburger, toggleHamburger }}>
      {children}
    </HamburgerMenuContext.Provider>
  );
}

export function useHamburgerMenu() {
  const context = useContext(HamburgerMenuContext);
  if (context === undefined) {
    throw new Error('useHamburgerMenu must be used within a HamburgerMenuProvider');
  }
  return context;
}
