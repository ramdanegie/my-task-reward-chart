import { NextResponse } from 'next/server';
import { ZodError, ZodType } from 'zod';

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  return schema.parse(await req.json()) as T;
}
export function handleError(e: unknown) {
  if (e instanceof ZodError) return fail(e.issues[0]?.message ?? 'Invalid input', 422);
  const msg = e instanceof Error ? e.message : 'Server error';
  if (msg === 'UNAUTHORIZED') return fail('Silakan login', 401);
  if (msg === 'FORBIDDEN') return fail('Akses ditolak', 403);
  return fail(msg, 500);
}
