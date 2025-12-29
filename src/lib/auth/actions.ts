'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithGoogle() {
  const supabase = await createClient();

  // Verify Supabase URL is configured correctly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('vercel.app') || supabaseUrl.includes('localhost')) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is incorrectly configured:', supabaseUrl);
    throw new Error('Supabase URL is not configured correctly. It must be your Supabase project URL, not your Vercel domain.');
  }

  // Get the current URL from headers (works in both dev and production)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  // Use environment variable if set, otherwise construct from headers
  let appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    appUrl = `${protocol}://${host}`;
  }
  
  // Ensure no trailing slash and proper format
  appUrl = appUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const redirectTo = `${appUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('OAuth error:', error);
    throw error;
  }

  if (data.url) {
    // Verify the URL is pointing to Supabase, not Vercel
    if (data.url.includes('vercel.app/auth/v1')) {
      console.error('ERROR: OAuth URL is incorrect. NEXT_PUBLIC_SUPABASE_URL might be wrong.');
      console.error('Generated URL:', data.url);
      console.error('Supabase URL env:', supabaseUrl);
      throw new Error('OAuth URL is pointing to Vercel instead of Supabase. Check NEXT_PUBLIC_SUPABASE_URL in Vercel environment variables.');
    }
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const supabase = await createClient();

  // Get the current URL from headers (works in both dev and production)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  // Use environment variable if set, otherwise construct from headers
  let appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    appUrl = `${protocol}://${host}`;
  }
  
  // Ensure no trailing slash
  appUrl = appUrl.replace(/\/+$/, '');
  const redirectTo = `${appUrl}/auth/callback?type=signup`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Ensure profile exists
  if (data.user) {
    await getUserProfile();
  }

  revalidatePath('/', 'layout');
  return data;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Create profile if it doesn't exist
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    // Create initial profile from auth user data
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        email: user.email,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return null;
    }

    return newProfile;
  }

  return existingProfile;
}

