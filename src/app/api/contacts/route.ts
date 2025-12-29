import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/utils/error-handler";
import { isValidUUID } from "@/lib/utils/uuid-validator";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobOfferId = searchParams.get("job_offer_id");

  if (!jobOfferId) {
    return NextResponse.json({ error: "job_offer_id is required" }, { status: 400 });
  }

  // Validar formato UUID
  if (!isValidUUID(jobOfferId)) {
    return NextResponse.json(
      { error: "Invalid job_offer_id format" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("job_offer_contacts")
    .select("*")
    .eq("job_offer_id", jobOfferId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al obtener los contactos");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data || []);
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
    job_offer_id,
    name,
    email,
    role,
    contact_channels = [],
    notes,
  } = body;

  if (!job_offer_id || !name) {
    return NextResponse.json(
      { error: "job_offer_id and name are required" },
      { status: 400 }
    );
  }

  // Validar formato UUID
  if (!isValidUUID(job_offer_id)) {
    return NextResponse.json(
      { error: "Invalid job_offer_id format" },
      { status: 400 }
    );
  }

  // Verify the job offer belongs to the user
  const { data: jobOffer, error: jobOfferError } = await supabase
    .from("job_offers")
    .select("id")
    .eq("id", job_offer_id)
    .eq("user_id", user.id)
    .single();

  if (jobOfferError || !jobOffer) {
    return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("job_offer_contacts")
    .insert({
      job_offer_id,
      user_id: user.id,
      name,
      email,
      role,
      contact_channels,
      notes,
    })
    .select()
    .single();

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al crear el contacto");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
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
  const { id, ...updates } = body;

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

  // Verificar ownership antes de actualizar
  const { data: existingContact, error: checkError } = await supabase
    .from("job_offer_contacts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (checkError || !existingContact) {
    return NextResponse.json(
      { error: "Contact not found or access denied" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("job_offer_contacts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al actualizar el contacto");
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
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Validar formato UUID
  if (!isValidUUID(id)) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("job_offer_contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    const errorResponse = createErrorResponse(error, "Error al eliminar el contacto");
    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

