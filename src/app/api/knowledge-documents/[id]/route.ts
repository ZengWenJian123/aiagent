import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const document = await prisma.knowledgeDocument.findFirst({
      where: { id, knowledgeBase: { userId } },
    });

    if (!document) {
      return jsonError("文档不存在", 404);
    }

    await prisma.knowledgeDocument.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("删除文档失败", 400);
  }
}