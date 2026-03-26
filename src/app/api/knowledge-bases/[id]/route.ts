import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { knowledgeBaseSchema } from "@/lib/schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const body = knowledgeBaseSchema.partial().parse(await request.json());
    const existing = await prisma.knowledgeBase.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return jsonError("知识库不存在", 404);
    }

    const updated = await prisma.knowledgeBase.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "更新知识库失败", 400);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const existing = await prisma.knowledgeBase.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return jsonError("知识库不存在", 404);
    }
    await prisma.knowledgeBase.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("删除知识库失败", 400);
  }
}