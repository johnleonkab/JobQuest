/**
 * Utilidades para manejo seguro de errores
 * Previene exposición de información sensible en mensajes de error
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitiza un mensaje de error para no exponer información sensible
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    // En producción, usar mensajes genéricos
    if (isProduction) {
      // Detectar tipos de errores comunes y retornar mensajes genéricos
      if (message.includes('violates foreign key constraint')) {
        return 'Error de integridad de datos';
      }
      if (message.includes('duplicate key value')) {
        return 'El recurso ya existe';
      }
      if (message.includes('null value in column')) {
        return 'Datos incompletos';
      }
      if (message.includes('permission denied')) {
        return 'No tienes permisos para realizar esta acción';
      }
      if (message.includes('relation') && message.includes('does not exist')) {
        return 'Error de base de datos';
      }
      if (message.includes('syntax error')) {
        return 'Error de sintaxis en la consulta';
      }

      // Error genérico para cualquier otro caso
      return 'Ha ocurrido un error. Por favor, intenta de nuevo más tarde.';
    }

    // En desarrollo, retornar el mensaje completo para debugging
    return message;
  }

  return 'Ha ocurrido un error desconocido';
}

/**
 * Crea una respuesta de error sanitizada
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'Ha ocurrido un error',
  status: number = 500
) {
  const sanitizedMessage = sanitizeErrorMessage(error);
  
  // Log completo del error solo en servidor (no se expone al cliente)
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  } else {
    console.error('Unknown error:', error);
  }

  return {
    error: sanitizedMessage,
    ...(isProduction ? {} : { 
      // En desarrollo, incluir más detalles
      details: error instanceof Error ? error.message : String(error)
    }),
  };
}


