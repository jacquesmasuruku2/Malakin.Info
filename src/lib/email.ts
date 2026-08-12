import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || '587');
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM;

if (!host || !user || !pass || !from) {
  console.warn('SMTP email is not fully configured. Email sending will be disabled.');
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
});

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
  if (!host || !user || !pass || !from) {
    throw new Error('SMTP configuration is missing');
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return info;
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name?: string | null;
}) {
  const subject = 'Bienvenue dans la newsletter MalakInfo';
  const html = `<p>Bonjour ${name ? name : 'cher abonné'},</p>
<p>Merci de vous être abonné à la newsletter de MalakInfo. Vous recevrez bientôt nos meilleurs contenus personnalisés en fonction de vos centres d'intérêt.</p>
<p>À très vite,<br/>L'équipe MalakInfo</p>`;
  const text = `Bonjour ${name ? name : 'cher abonné'},\n\nMerci de vous être abonné à la newsletter de MalakInfo. Vous recevrez bientôt nos meilleurs contenus personnalisés en fonction de vos centres d'intérêt.\n\nÀ très vite,\nL'équipe MalakInfo`;

  return sendNewsletterEmail({ to, subject, html, text });
}
