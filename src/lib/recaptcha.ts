export type RecaptchaVerificationResult = 'success' | 'invalid' | 'not_configured' | 'unavailable';

export async function verifyRecaptchaToken(token: string): Promise<RecaptchaVerificationResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return 'not_configured';

  let response: Response;
  try {
    response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
  } catch (error) {
    console.error('reCAPTCHA verification request failed:', error);
    return 'unavailable';
  }

  if (!response.ok) {
    console.error('reCAPTCHA verification returned an unsuccessful HTTP status:', response.status);
    return 'unavailable';
  }

  let verification: unknown;
  try {
    verification = await response.json();
  } catch (error) {
    console.error('reCAPTCHA verification returned invalid JSON:', error);
    return 'unavailable';
  }

  if (
    typeof verification === 'object'
    && verification !== null
    && 'success' in verification
    && verification.success === true
  ) {
    return 'success';
  }

  return 'invalid';
}
