import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse(
    {
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

export function validateRequest<T>(schema: ZodSchema<T>, body: unknown): { data: T } | { error: Response } {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      error: errorResponse('Invalid request body', 400, parsed.error.flatten()),
    };
  }

  return { data: parsed.data };
}