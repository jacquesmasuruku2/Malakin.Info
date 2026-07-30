'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Fade out after hydration is complete
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-700 ease-in-out ${
        isMounted ? 'opacity-100' : 'opacity-0'
      } ${!isVisible ? 'opacity-0 pointer-events-none' : ''}`}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary animate-pulse">
            MalakInfo.com
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-muted-foreground text-sm md:text-base animate-pulse">
          L'info qui traverse les frontières
        </p>
      </div>
    </div>
  );
}
