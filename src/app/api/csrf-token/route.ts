import { NextResponse } from "next/server";
import { getCSRFTokenForClient } from "@/lib/utils/csrf";

/**
 * Endpoint para obtener el token CSRF
 * El token se establece automáticamente en las cookies
 */
export async function GET() {
  try {
    const token = await getCSRFTokenForClient();
    
    const response = NextResponse.json({ token });
    
    // Asegurar que las cookies se envíen correctamente
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return NextResponse.json(
      { error: "Error generating CSRF token" },
      { status: 500 }
    );
  }
}

