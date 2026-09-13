'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { allowsAds, allowsAnalytics, CONSENT_UPDATED_EVENT, readConsentPreferences } from '@/lib/consent';

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-4621769509750492';

export default function ConsentScripts() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [adsAllowed, setAdsAllowed] = useState(false);

  useEffect(() => {
    const applyConsent = () => {
      const preferences = readConsentPreferences();
      setAnalyticsAllowed(allowsAnalytics(preferences));
      setAdsAllowed(allowsAds(preferences));
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
      {adsAllowed && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
