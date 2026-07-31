'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

export default function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block' },
  className = '',
  fullWidthResponsive = true,
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Skip if ad is already loaded
    if (isAdLoaded) return;

    // Check if the ad element already has content (already initialized)
    if (adRef.current && adRef.current.innerHTML.trim() !== '') {
      setIsAdLoaded(true);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
        setIsAdLoaded(true);
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [adSlot, isAdLoaded]);

  return (
    <div className={`adsense-ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-4621769509750492"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
