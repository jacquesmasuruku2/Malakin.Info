'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ServicesModalContextType {
  isServicesOpen: boolean;
  openServices: () => void;
  closeServices: () => void;
  toggleServices: () => void;
}

const ServicesModalContext = createContext<ServicesModalContextType | undefined>(undefined);

export function ServicesModalProvider({ children }: { children: ReactNode }) {
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const openServices = () => setIsServicesOpen(true);
  const closeServices = () => setIsServicesOpen(false);
  const toggleServices = () => setIsServicesOpen((prev) => !prev);

  return (
    <ServicesModalContext.Provider value={{ isServicesOpen, openServices, closeServices, toggleServices }}>
      {children}
    </ServicesModalContext.Provider>
  );
}

export function useServicesModal() {
  const context = useContext(ServicesModalContext);
  if (context === undefined) {
    throw new Error('useServicesModal must be used within a ServicesModalProvider');
  }
  return context;
}
