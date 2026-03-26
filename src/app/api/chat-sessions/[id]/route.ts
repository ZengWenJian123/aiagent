import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sessionUpdateSchema } from "@/lib/schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const body = sessionUpdateSchema.parse(await request.json());
    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return jsonError("会话不存在", 404);
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "更新会话失败", 400);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
    });
    if (!session) {
      return jsonError("会话不存在", 404);
    }
    await prisma.chatSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("删除失败", 400);
  }
}