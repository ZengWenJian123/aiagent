import { NextResponse } from "next/server";
import { KB_ACCEPTED_TYPES } from "@/lib/documents";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { indexKnowledgeDocument } from "@/lib/rag";
import { persistFile } from "@/lib/storage";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: { id, userId },
    });
    if (!knowledgeBase) {
      return jsonError("知识库不存在", 404);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return jsonError("请选择文件");
    }

    if (!KB_ACCEPTED_TYPES.includes(file.type)) {
      return jsonError("知识库仅支持 PDF、DOCX、TXT、MD");
    }

    const storagePath = await persistFile(file, "knowledge");
    const document = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId: id,
        fileName: file.name,
        mimeType: file.type,
        storagePath,
        parseStatus: "PROCESSING",
      },
    });

    await indexKnowledgeDocument(document.id, storagePath, file.type);
    return NextResponse.json(document);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "上传知识库文档失败", 400);
  }
}