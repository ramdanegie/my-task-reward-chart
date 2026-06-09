import { z } from 'zod';
import { prisma } from '@/server/db';
import { hashPassword } from '@/server/auth/password';
import { ok, fail, parseBody, handleError } from '@/lib/http';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(req: Request) {
  try {
    const { name, email, password } = await parseBody(req, schema);
    const lower = email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: lower } });
    if (exists) return fail('Email sudah terdaftar', 409);
    const user = await prisma.user.create({
      data: { name, email: lower, passwordHash: await hashPassword(password) },
    });
    return ok({ id: user.id, email: user.email }, 201);
  } catch (e) {
    return handleError(e);
  }
}
