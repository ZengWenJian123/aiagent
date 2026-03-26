import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { indexKnowledgeDocument } from "@/lib/rag";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const base = await prisma.knowledgeBase.findFirst({
      where: { id, userId },
      include: { documents: true },
    });
    if (!base) {
      return jsonError("知识库不存在", 404);
    }

    for (const document of base.documents) {
      await prisma.knowledgeDocument.update({
        where: { id: document.id },
        data: { parseStatus: "PROCESSING" },
      });
      await indexKnowledgeDocument(document.id, document.storagePath, document.mimeType);
    }
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("重建索引失败", 400);
  }
}