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
  const [isAdFree, setIsAdFree] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  const placeholderSlots = ['1234567890', '0987654321', '3333333333'];
  const isValidAdConfig = Boolean(adClientId) && Boolean(adSlot) && !placeholderSlots.includes(adSlot.trim()) && !adClientId.includes('XXXXXXXXXXXXXXXX');

  useEffect(() => {
    const checkAdFreeStatus = async () => {
      try {
        const response = await fetch('/api/user/ad-free-status');
        const data = await response.json();
        setIsAdFree(data.adFree);
      } catch (error) {
        console.error('Error checking ad-free status:', error);
        setIsAdFree(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdFreeStatus();
  }, []);

  useEffect(() => {
    if (!isValidAdConfig || isAdLoaded || isAdFree || isLoading) return;

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
  }, [adSlot, isAdLoaded, isValidAdConfig, isAdFree, isLoading]);

  if (!isValidAdConfig || isAdFree) {
    return null;
  }

  return (
    <div className={`adsense-ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={adClientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
