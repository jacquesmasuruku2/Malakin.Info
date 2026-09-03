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

export async function sendPartnershipConfirmationEmail({
  to,
  name,
  companyName,
  partnershipType,
}: {
  to: string;
  name: string;
  companyName: string;
  partnershipType: string;
}) {
  const subject = 'Confirmation de votre demande de partenariat - MalakInfo';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #081c3d 0%, #0b3b8b 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MalakInfo</h1>
        <p style="color: #d4af37; margin: 10px 0 0; font-size: 14px;">L'info qui traverse les frontières</p>
      </div>
      
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #081c3d; margin-top: 0;">Demande de partenariat reçue</h2>
        
        <p>Bonjour <strong>${name}</strong>,</p>
        
        <p>Nous avons bien reçu votre demande de partenariat au nom de <strong>${companyName}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #666;"><strong>Type de partenariat :</strong> ${partnershipType}</p>
        </div>
        
        <p>Notre équipe va examiner votre demande et vous contactera dans un délai de <strong>48 à 72 heures</strong>.</p>
        
        <p>Si vous avez des questions urgentes, n'hésitez pas à nous contacter directement à :</p>
        <p style="margin: 10px 0;">
          <strong>Email :</strong> partnerships@malakinfo.com<br>
          <strong>Téléphone :</strong> +243 000 000 000
        </p>
        
        <p>Merci de votre intérêt pour MalakInfo.</p>
        
        <p style="margin-top: 30px; color: #666;">
          Cordialement,<br>
          <strong>L'équipe MalakInfo</strong>
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin: 0;">© 2026 MalakInfo. Tous droits réservés.</p>
        <p style="margin: 5px 0 0;">Kinshasa, République Démocratique du Congo</p>
      </div>
    </div>
  `;

  const text = `Bonjour ${name},

Nous avons bien reçu votre demande de partenariat au nom de ${companyName}.

Type de partenariat : ${partnershipType}

Notre équipe va examiner votre demande et vous contactera dans un délai de 48 à 72 heures.

Si vous avez des questions urgentes, n'hésitez pas à nous contacter directement à :
Email : partnerships@malakinfo.com
Téléphone : +243 000 000 000

Merci de votre intérêt pour MalakInfo.

Cordialement,
L'équipe MalakInfo`;

  return sendNewsletterEmail({ to, subject, html, text });
}
