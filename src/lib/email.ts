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

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name?: string | null;
  resetUrl: string;
}) {
  const subject = 'Réinitialisation de votre mot de passe MalakInfo';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Bonjour ${name || 'Utilisateur'},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block; background:#0B3B8B; color:#fff; padding:12px 18px; border-radius:8px; text-decoration:none; font-weight:bold;">
          Définir un nouveau mot de passe
        </a>
      </p>
      <p>Ce lien est valable pendant 1 heure.</p>
      <p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p>
      <p>À très vite,<br/>L'équipe MalakInfo</p>
    </div>
  `;

  const text = `Bonjour ${name || 'Utilisateur'},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien pour définir un nouveau mot de passe : ${resetUrl}\n\nCe lien est valable pendant 1 heure.\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n\nÀ très vite,\nL'équipe MalakInfo`;

  return sendNewsletterEmail({ to, subject, html, text });
}
