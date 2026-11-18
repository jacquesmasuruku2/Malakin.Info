'use client';

import { useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

type RecaptchaWidgetProps = {
  siteKey: string;
  resetKey: number;
  onChange: (token: string | null) => void;
};

export default function RecaptchaWidget({ siteKey, resetKey, onChange }: RecaptchaWidgetProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const previousResetKey = useRef(resetKey);

  useEffect(() => {
    if (previousResetKey.current !== resetKey) {
      recaptchaRef.current?.reset();
      onChange(null);
      previousResetKey.current = resetKey;
    }
  }, [onChange, resetKey]);

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      onChange={onChange}
      onExpired={() => onChange(null)}
      onErrored={() => onChange(null)}
    />
  );
}
