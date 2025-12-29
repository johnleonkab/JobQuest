import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type');
    const updates: any = {};
    let avatarFile: File | null = null;

    // Handle JSON requests (from OnboardingModal)
    if (contentType?.includes('application/json')) {
      const jsonData = await request.json();
      
      if (jsonData.first_name !== undefined) {
        updates.first_name = jsonData.first_name;
      }
      if (jsonData.last_name !== undefined) {
        updates.last_name = jsonData.last_name;
      }
      if (jsonData.headline !== undefined) {
        updates.headline = jsonData.headline;
      }
      if (jsonData.linkedin_url !== undefined) {
        updates.linkedin_url = jsonData.linkedin_url;
      }
      if (jsonData.gender !== undefined) {
        updates.gender = jsonData.gender;
      }
      if (jsonData.birth_date !== undefined) {
        updates.birth_date = jsonData.birth_date;
      }
      if (jsonData.avatar_url === null) {
        updates.avatar_url = null;
      }
    } else {
      // Handle FormData requests (from Profile page with file upload)
      const formData = await request.formData();

      // Handle text fields
      if (formData.has('first_name')) {
        updates.first_name = formData.get('first_name');
      }
      if (formData.has('last_name')) {
        updates.last_name = formData.get('last_name');
      }
      if (formData.has('headline')) {
        updates.headline = formData.get('headline');
      }
      if (formData.has('linkedin_url')) {
        updates.linkedin_url = formData.get('linkedin_url');
      }
      if (formData.has('gender')) {
        updates.gender = formData.get('gender');
      }
      if (formData.has('birth_date')) {
        updates.birth_date = formData.get('birth_date');
      }
      if (formData.has('avatar_url') && formData.get('avatar_url') === 'null') {
        updates.avatar_url = null;
      }

      // Handle avatar file upload
      avatarFile = formData.get('avatar') as File | null;
    }
    if (avatarFile) {
      // Validar tipo MIME
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(avatarFile.type)) {
        return NextResponse.json(
          { error: 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG o WebP' },
          { status: 400 }
        );
      }

      // Validar extensión del archivo
      const fileExt = avatarFile.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        return NextResponse.json(
          { error: 'Extensión de archivo no permitida. Solo se permiten .jpg, .jpeg, .png o .webp' },
          { status: 400 }
        );
      }

      // Validar tamaño del archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (avatarFile.size > maxSize) {
        return NextResponse.json(
          { error: 'El archivo es demasiado grande. El tamaño máximo es 5MB' },
          { status: 400 }
        );
      }

      // Validar que el archivo no esté vacío
      if (avatarFile.size === 0) {
        return NextResponse.json(
          { error: 'El archivo está vacío' },
          { status: 400 }
        );
      }

      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) {
        return NextResponse.json(
          { error: 'Error uploading avatar' },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      updates.avatar_url = publicUrl;
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

