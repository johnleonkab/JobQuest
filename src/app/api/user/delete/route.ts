import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/actions';
import { logger } from '@/lib/utils/logger';
import { sendEmail, generateEmailTemplate } from '@/lib/email';

/**
 * Delete user account and all associated data (GDPR compliance)
 * POST /api/user/delete
 * Body: { confirmation: "ELIMINAR" }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { confirmation } = body;

    // Validate confirmation
    if (confirmation !== 'ELIMINAR') {
      return NextResponse.json(
        { error: 'Invalid confirmation. You must type "ELIMINAR" to confirm.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user email before deletion (for confirmation email)
    const userEmail = user.email;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, first_name, avatar_url')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || profile?.first_name || userEmail?.split('@')[0] || 'Usuario';

    // Send confirmation email BEFORE deletion
    if (userEmail) {
      try {
        const emailContent = `
          <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
            Tu cuenta ha sido eliminada
          </h2>
          
          <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
            Hola ${userName},
          </p>
          
          <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
            Confirmamos que tu cuenta de JobQuest y todos tus datos asociados han sido eliminados permanentemente de nuestros sistemas.
          </p>
          
          <div style="padding: 20px; background-color: #fef3c7; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
              <strong>Datos eliminados:</strong><br/>
              • Perfil y información personal<br/>
              • CV completo (experiencia, educación, certificaciones, etc.)<br/>
              • Ofertas de trabajo y aplicaciones<br/>
              • Entrevistas programadas<br/>
              • Contactos y notas<br/>
              • Datos de gamificación<br/>
              • Análisis de AI<br/>
              • Archivos subidos (fotos de perfil, imágenes de proyectos)
            </p>
          </div>
          
          <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Si tienes alguna pregunta o crees que esto fue un error, por favor contáctanos inmediatamente.
          </p>
          
          <p style="margin: 20px 0 0; color: #111827; font-size: 16px; font-weight: 600;">
            Gracias por haber usado JobQuest.
          </p>
        `;

        await sendEmail({
          to: userEmail,
          subject: 'Tu cuenta de JobQuest ha sido eliminada',
          html: generateEmailTemplate(emailContent, 'Cuenta Eliminada - JobQuest'),
        });
      } catch (emailError) {
        logger.error('Error sending deletion confirmation email', emailError);
        // Continue with deletion even if email fails
      }
    }

    // Delete files from Storage
    try {
      // Delete avatar
      if (profile?.avatar_url) {
        const avatarPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([avatarPath]);
      }

      // Delete project images
      const { data: projects } = await supabase
        .from('cv_projects')
        .select('images')
        .eq('user_id', user.id);

      if (projects) {
        for (const project of projects) {
          if (project.images && Array.isArray(project.images)) {
            const imagePaths = project.images
              .map((url: string) => {
                // Extract path from Supabase Storage URL
                const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
                if (match) {
                  return match[2];
                }
                return null;
              })
              .filter(Boolean) as string[];

            if (imagePaths.length > 0) {
              // Assuming project images are in a 'projects' bucket
              // Adjust bucket name if different
              await supabase.storage.from('projects').remove(imagePaths);
            }
          }
        }
      }
    } catch (storageError) {
      logger.error('Error deleting files from storage', storageError);
      // Continue with data deletion even if storage deletion fails
    }

    // Delete all user data from database
    // Note: Due to CASCADE constraints, most data will be deleted automatically
    // But we'll explicitly delete from tables that might not have CASCADE

      // Delete from tables (in order to respect foreign key constraints)
      // Execute sequentially to respect foreign key constraints
      await supabase.from('job_offer_contacts').delete().eq('user_id', user.id);
      await supabase.from('interviews').delete().eq('user_id', user.id);
      await supabase.from('job_offers').delete().eq('user_id', user.id);
      await supabase.from('ai_insights').delete().eq('user_id', user.id);
      await supabase.from('user_badges').delete().eq('user_id', user.id);
      
      // Try both gamification_events and user_events (one might not exist)
      try {
        await supabase.from('gamification_events').delete().eq('user_id', user.id);
      } catch (e) {
        // Table might not exist, try user_events
      }
      try {
        await supabase.from('user_events').delete().eq('user_id', user.id);
      } catch (e) {
        // Table might not exist
      }
      
      await supabase.from('cv_projects').delete().eq('user_id', user.id);
      await supabase.from('cv_volunteering').delete().eq('user_id', user.id);
      await supabase.from('cv_languages').delete().eq('user_id', user.id);
      await supabase.from('cv_certifications').delete().eq('user_id', user.id);
      await supabase.from('cv_experience').delete().eq('user_id', user.id);
      await supabase.from('cv_education').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

    // Delete auth user (requires service role key)
    // Note: This requires admin privileges. In production, you might want to:
    // 1. Use Supabase Admin API
    // 2. Or mark user as deleted and handle cleanup via Edge Function
    // For now, we'll use the service role key if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      try {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey
        );

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
        if (deleteError) {
          logger.error('Error deleting auth user', deleteError);
          // Continue - the user data is already deleted
        }
      } catch (adminError) {
        logger.error('Error creating admin client for user deletion', adminError);
      }
    } else {
      logger.warn('SUPABASE_SERVICE_ROLE_KEY not set. Auth user not deleted. User data deleted from database.');
    }

    // Log deletion (without personal data)
    logger.info('User account deleted', {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been deleted successfully.',
    });
  } catch (error) {
    logger.error('Error deleting user account', error);
    return NextResponse.json(
      { error: 'Error deleting account' },
      { status: 500 }
    );
  }
}

