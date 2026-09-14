'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { allowsAds, allowsAnalytics, CONSENT_UPDATED_EVENT, readConsentPreferences } from '@/lib/consent';

function updateGoogleConsent(adsAllowed: boolean, analyticsAllowed: boolean) {
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;

  gtag('consent', 'update', {
    ad_storage: adsAllowed ? 'granted' : 'denied',
    ad_user_data: adsAllowed ? 'granted' : 'denied',
    ad_personalization: adsAllowed ? 'granted' : 'denied',
    analytics_storage: analyticsAllowed ? 'granted' : 'denied',
  });
}

export default function ConsentScripts() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const applyConsent = () => {
      const preferences = readConsentPreferences();
      const nextAnalyticsAllowed = allowsAnalytics(preferences);
      const nextAdsAllowed = allowsAds(preferences);
      setAnalyticsAllowed(nextAnalyticsAllowed);
      updateGoogleConsent(nextAdsAllowed, nextAnalyticsAllowed);
    };

    applyConsent();
    window.addEventListener(CONSENT_UPDATED_EVENT, applyConsent);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, applyConsent);
  }, []);

  return (
    <>
      {analyticsAllowed && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WTSZH2PT');`}
          </Script>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-8V0GJZF6WD"
            strategy="afterInteractive"
          />
          <Script id="gtag-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-8V0GJZF6WD');`}
          </Script>
        </>
      )}
    </>
  );
}
