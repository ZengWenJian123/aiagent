import { NextResponse } from "next/server";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });

    if (exists) {
      return jsonError("用户名或邮箱已存在", 409);
    }

    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash: await hashPassword(body.password),
      },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);
    return NextResponse.json(user);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "注册失败", 400);
  }
}