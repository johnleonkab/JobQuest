import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils/error-handler";
import { validateFieldLength } from "@/lib/utils/input-validator";
import { isValidUUID } from "@/lib/utils/uuid-validator";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("cv_experience")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al obtener la experiencia laboral");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    company_name,
    position,
    start_date,
    end_date,
    is_current,
    description,
    skills,
  } = body;

  // Validar campos requeridos
  if (!company_name || !position) {
    return NextResponse.json(
      { error: "company_name and position are required" },
      { status: 400 }
    );
  }

  // Validar longitud de campos
  const companyNameValidation = validateFieldLength(company_name, "company_name", true);
  if (!companyNameValidation.valid) {
    return NextResponse.json(
      { error: companyNameValidation.error },
      { status: 400 }
    );
  }

  const positionValidation = validateFieldLength(position, "position", true);
  if (!positionValidation.valid) {
    return NextResponse.json(
      { error: positionValidation.error },
      { status: 400 }
    );
  }

  if (description) {
    const descValidation = validateFieldLength(description, "description");
    if (!descValidation.valid) {
      return NextResponse.json(
        { error: descValidation.error },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("cv_experience")
    .insert({
      user_id: user.id,
      company_name,
      position,
      start_date,
      end_date: is_current ? null : end_date,
      is_current,
      description,
      skills: skills || [],
    })
    .select()
    .single();

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al obtener la experiencia laboral");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, is_current, end_date, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Validar formato UUID
  if (!isValidUUID(id)) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    );
  }

  // Validar longitud de campos si están presentes
  if (updates.company_name !== undefined) {
    const validation = validateFieldLength(updates.company_name, "company_name", true);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
  }

  if (updates.position !== undefined) {
    const validation = validateFieldLength(updates.position, "position", true);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
  }

  if (updates.description !== undefined && updates.description) {
    const validation = validateFieldLength(updates.description, "description");
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
  }

  // Preparar los datos para actualizar, manejando end_date cuando is_current es true
  const updateData = {
    ...updates,
    is_current,
    end_date: is_current ? null : (end_date || null),
  };

  const { data, error } = await supabase
    .from("cv_experience")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al actualizar la experiencia laboral");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Validar formato UUID
  if (!isValidUUID(id)) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("cv_experience")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al obtener la experiencia laboral");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

