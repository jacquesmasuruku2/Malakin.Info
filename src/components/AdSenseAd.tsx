'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT } from '@/lib/adsense';
import { allowsAds, CONSENT_UPDATED_EVENT, readConsentPreferences } from '@/lib/consent';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

const PLACEHOLDER_SLOTS = new Set(['1234567890', '0987654321', '3333333333']);

export default function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block', minHeight: 90 },
  className = '',
  fullWidthResponsive = true,
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdFree, setIsAdFree] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adsAllowed, setAdsAllowed] = useState(false);

  const trimmedSlot = adSlot.trim();
  const isValidAdConfig =
    Boolean(ADSENSE_CLIENT) &&
    Boolean(trimmedSlot) &&
    !PLACEHOLDER_SLOTS.has(trimmedSlot) &&
    !ADSENSE_CLIENT.includes('XXXXXXXXXXXXXXXX');

  useEffect(() => {
    const applyConsent = () => {
      setAdsAllowed(allowsAds(readConsentPreferences()));
    };

    applyConsent();
    window.addEventListener(CONSENT_UPDATED_EVENT, applyConsent);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, applyConsent);
  }, []);

  useEffect(() => {
    const checkAdFreeStatus = async () => {
      try {
        const response = await fetch('/api/user/ad-free-status');
        const data = await response.json();
        setIsAdFree(Boolean(data.adFree));
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
    if (!isValidAdConfig || isAdLoaded || isAdFree || isLoading || !adsAllowed) return;

    if (adRef.current?.getAttribute('data-adsbygoogle-status')) {
      setIsAdLoaded(true);
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const adsbygoogle = (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle;

      if (!adsbygoogle) {
        if (attempts >= 40) window.clearInterval(timer);
        return;
      }

      try {
        adsbygoogle.push({});
        setIsAdLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
      }
      window.clearInterval(timer);
    }, 250);

    return () => window.clearInterval(timer);
  }, [adSlot, adsAllowed, isAdFree, isAdLoaded, isLoading, isValidAdConfig]);

  if (!isValidAdConfig || isAdFree || !adsAllowed) {
    return null;
  }

  return (
    <div className={`adsense-ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={trimmedSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
