export type NewsletterSubscribeResult =
  | { status: 'created' | 'reactivated' }
  | { status: 'already_subscribed' }
  | { status: 'error'; message: string };

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      consent: true,
      interests: ['actualites', 'economie', 'culture', 'sport', 'tech'],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 409 || data?.code === 'already_subscribed') {
    return { status: 'already_subscribed' };
  }

  if (!response.ok) {
    return {
      status: 'error',
      message: typeof data?.error === 'string' ? data.error : '',
    };
  }

  return { status: data?.code === 'reactivated' ? 'reactivated' : 'created' };
}
