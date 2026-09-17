import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || '587');
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = (process.env.EMAIL_FROM || 'Malakinfo <no-reply@malakinfo.com>').replace(
  /<\s*noreplay@/i,
  '<no-reply@',
);

if (!host || !user || !pass || !from) {
  console.warn('[admin email] SMTP is not fully configured.');
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
});

export function isSmtpConfigured() {
  return Boolean(host && user && pass && from);
}

export async function sendNewsletterEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!isSmtpConfigured()) {
    throw new Error('Configuration SMTP manquante sur le panel admin');
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
