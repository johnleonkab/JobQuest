/**
 * Email utility for sending notifications
 * Uses Resend for email delivery
 */

import { Resend } from 'resend';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('RESEND_API_KEY not configured. Emails will be logged only.');
    }
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const client = getResendClient();
    const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || 'JobQuest <onboarding@resend.dev>';

    // In development without Resend configured, log the email
    if (!client) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          from: fromEmail,
          html: options.html.substring(0, 100) + '...',
        });
        return true;
      }
      console.warn('Resend not configured. Email not sent.');
      return false;
    }

    // Send email via Resend
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email sent via Resend:', {
        id: data?.id,
        to: options.to,
        subject: options.subject,
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate email template with common styling
 */
export function generateEmailTemplate(content: string, title?: string): string {
  const appName = 'JobQuest';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${appName}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                <a href="${appUrl}/privacy" style="color: #9ca3af; text-decoration: none;">Política de Privacidad</a> | 
                <a href="${appUrl}/terms" style="color: #9ca3af; text-decoration: none;">Términos de Servicio</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Welcome email template
 */
export function generateWelcomeEmail(userName: string, userEmail: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
      ¡Bienvenido a JobQuest, ${userName}! 🎉
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Estamos emocionados de tenerte a bordo. JobQuest te ayudará a convertir tu búsqueda de empleo en una aventura épica.
    </p>
    
    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
      <strong>¿Por dónde empezar?</strong>
    </p>
    
    <table role="presentation" style="width: 100%; margin: 0 0 30px;">
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #ec4899;">
          <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px;">
            📝 Construye tu CV
          </h3>
          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.5;">
            Agrega tu experiencia, educación, certificaciones y más. Cada sección que completes te dará puntos de experiencia.
          </p>
          <a href="${appUrl}/cv-builder" style="display: inline-block; padding: 10px 20px; background-color: #ec4899; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Ir al CV Builder →
          </a>
        </td>
      </tr>
    </table>
    
    <table role="presentation" style="width: 100%; margin: 0 0 30px;">
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px;">
            💼 Gestiona tus Ofertas
          </h3>
          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.5;">
            Organiza todas tus postulaciones en un tablero Kanban. Gana puntos por cada entrevista programada.
          </p>
          <a href="${appUrl}/job-openings" style="display: inline-block; padding: 10px 20px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Ver Ofertas →
          </a>
        </td>
      </tr>
    </table>
    
    <table role="presentation" style="width: 100%; margin: 0 0 30px;">
      <tr>
        <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px;">
            🎮 Sube de Nivel
          </h3>
          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.5;">
            Completa acciones para ganar XP, subir de nivel y desbloquear badges. ¡Convierte tu búsqueda en un juego!
          </p>
          <a href="${appUrl}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Ver Dashboard →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte a conseguir el trabajo de tus sueños!
    </p>
    
    <p style="margin: 20px 0 0; color: #111827; font-size: 16px; font-weight: 600;">
      ¡Buena suerte en tu aventura! 🚀
    </p>
  `;
  
  return generateEmailTemplate(content, `Bienvenido a ${process.env.NEXT_PUBLIC_APP_NAME || 'JobQuest'}`);
}

/**
 * Weekly digest email template
 */
export function generateWeeklyDigestEmail(
  userName: string,
  data: {
    xpGained: number;
    currentLevel: number;
    badgesEarned: number;
    jobOffersAdded: number;
    interviewsThisWeek: number;
    cvSectionsUpdated: number;
  }
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
      📊 Tu Resumen Semanal, ${userName}
    </h2>
    
    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
      Aquí está tu progreso de la semana pasada:
    </p>
    
    <table role="presentation" style="width: 100%; margin: 0 0 30px;">
      <tr>
        <td style="padding: 15px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">
            +${data.xpGained} XP
          </div>
          <div style="font-size: 14px; color: #92400e;">
            Puntos ganados esta semana
          </div>
        </td>
        <td style="padding: 15px; background-color: #dbeafe; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">
            Nivel ${data.currentLevel}
          </div>
          <div style="font-size: 14px; color: #1e40af;">
            Tu nivel actual
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px; background-color: #fce7f3; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #ec4899; margin-bottom: 5px;">
            ${data.badgesEarned}
          </div>
          <div style="font-size: 14px; color: #9f1239;">
            Badges obtenidos
          </div>
        </td>
        <td style="padding: 15px; background-color: #d1fae5; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 5px;">
            ${data.jobOffersAdded}
          </div>
          <div style="font-size: 14px; color: #065f46;">
            Ofertas agregadas
          </div>
        </td>
      </tr>
    </table>
    
    ${data.interviewsThisWeek > 0 ? `
    <div style="padding: 20px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px;">
        📅 Entrevistas Esta Semana
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Tienes <strong>${data.interviewsThisWeek}</strong> entrevista(s) programada(s) esta semana. ¡Prepárate bien!
      </p>
      <a href="${appUrl}/job-openings" style="display: inline-block; margin-top: 15px; padding: 8px 16px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Ver Entrevistas →
      </a>
    </div>
    ` : ''}
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      <a href="${appUrl}/dashboard" style="color: #ec4899; text-decoration: none; font-weight: 600;">
        Ver tu dashboard completo →
      </a>
    </p>
    
    <p style="margin: 20px 0 0; color: #111827; font-size: 16px; font-weight: 600;">
      ¡Sigue así! 💪
    </p>
  `;
  
  return generateEmailTemplate(content, 'Tu Resumen Semanal - JobQuest');
}

/**
 * Interview reminder email template
 */
export function generateInterviewReminderEmail(
  userName: string,
  interview: {
    title: string;
    scheduledAt: string;
    interviewType: string;
    location?: string;
    jobOfferTitle?: string;
    jobOfferCompany?: string;
    jobOfferId?: string;
  }
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app';
  const interviewDate = new Date(interview.scheduledAt);
  const formattedDate = interviewDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = interviewDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
      📅 Recordatorio de Entrevista
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hola ${userName},
    </p>
    
    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
      Te recordamos que tienes una entrevista programada para <strong>mañana</strong>:
    </p>
    
    <table role="presentation" style="width: 100%; margin: 0 0 30px; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
      <tr>
        <td style="padding-bottom: 15px;">
          <strong style="color: #111827; font-size: 18px;">${interview.title}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 10px; color: #6b7280; font-size: 14px;">
          📅 <strong>Fecha:</strong> ${formattedDate}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 10px; color: #6b7280; font-size: 14px;">
          🕐 <strong>Hora:</strong> ${formattedTime}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 10px; color: #6b7280; font-size: 14px;">
          📋 <strong>Tipo:</strong> ${interview.interviewType}
        </td>
      </tr>
      ${interview.location ? `
      <tr>
        <td style="padding-bottom: 10px; color: #6b7280; font-size: 14px;">
          📍 <strong>Ubicación:</strong> ${interview.location}
        </td>
      </tr>
      ` : ''}
      ${interview.jobOfferTitle ? `
      <tr>
        <td style="padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          💼 <strong>Oferta:</strong> ${interview.jobOfferTitle}${interview.jobOfferCompany ? ` en ${interview.jobOfferCompany}` : ''}
        </td>
      </tr>
      ` : ''}
    </table>
    
    <div style="padding: 20px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px;">
        💡 Tips para la Entrevista
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
        <li>Revisa tu CV y la descripción del puesto</li>
        <li>Prepara preguntas para el entrevistador</li>
        <li>Llega 10 minutos antes</li>
        <li>Mantén una actitud positiva y confiada</li>
      </ul>
    </div>
    
    ${interview.jobOfferId ? `
    <a href="${appUrl}/job-openings?offer=${interview.jobOfferId}" style="display: inline-block; padding: 12px 24px; background-color: #ec4899; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-bottom: 20px;">
      Ver Detalles de la Oferta →
    </a>
    ` : ''}
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      ¡Mucha suerte en tu entrevista! 🍀
    </p>
  `;
  
  return generateEmailTemplate(content, 'Recordatorio de Entrevista - JobQuest');
}

/**
 * Achievement notification email template
 */
export function generateAchievementEmail(
  userName: string,
  achievement: {
    type: 'level_up' | 'badge_earned';
    level?: number;
    badgeName?: string;
    badgeDescription?: string;
    badgeIcon?: string;
    nextLevelXp?: number;
    currentXp?: number;
  }
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://job-quest-bice.vercel.app';
  
  let content = '';
  
  if (achievement.type === 'level_up') {
    content = `
      <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; text-align: center;">
        🎉 ¡Subiste de Nivel!
      </h2>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; padding: 30px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; width: 120px; height: 120px; line-height: 60px;">
          <span style="font-size: 60px; font-weight: bold; color: #ffffff;">
            ${achievement.level}
          </span>
        </div>
      </div>
      
      <p style="margin: 0 0 20px; color: #374151; font-size: 18px; text-align: center; font-weight: 600;">
        ¡Felicidades, ${userName}!
      </p>
      
      <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
        Has alcanzado el <strong>Nivel ${achievement.level}</strong>. ¡Sigue así y llegarás aún más lejos!
      </p>
      
      ${achievement.nextLevelXp ? `
      <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
          Progreso hacia el siguiente nivel
        </p>
        <div style="background-color: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%); height: 100%; width: ${achievement.currentXp && achievement.nextLevelXp ? Math.min(100, (achievement.currentXp / achievement.nextLevelXp) * 100) : 0}%;"></div>
        </div>
        <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          ${achievement.currentXp || 0} / ${achievement.nextLevelXp} XP
        </p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #ec4899; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Ver tu Progreso →
        </a>
      </div>
    `;
  } else if (achievement.type === 'badge_earned') {
    content = `
      <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; text-align: center;">
        🏆 ¡Nuevo Badge Desbloqueado!
      </h2>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; padding: 30px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 50%; width: 120px; height: 120px; line-height: 60px;">
          <span style="font-size: 60px;">
            ${achievement.badgeIcon || '🏆'}
          </span>
        </div>
      </div>
      
      <p style="margin: 0 0 10px; color: #374151; font-size: 20px; text-align: center; font-weight: 600;">
        ${achievement.badgeName}
      </p>
      
      ${achievement.badgeDescription ? `
      <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
        ${achievement.badgeDescription}
      </p>
      ` : ''}
      
      <p style="margin: 0 0 30px; color: #374151; font-size: 16px; text-align: center; line-height: 1.6;">
        ¡Felicidades, ${userName}! Has desbloqueado este badge especial.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/gamification" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Ver todos tus Badges →
        </a>
      </div>
    `;
  }
  
  return generateEmailTemplate(content, '¡Logro Desbloqueado! - JobQuest');
}

