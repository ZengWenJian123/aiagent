import { NextResponse } from "next/server";
import { CHAT_ACCEPTED_TYPES } from "@/lib/documents";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { persistFile } from "@/lib/storage";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const formData = await request.formData();
    const file = formData.get("file");
    const purpose = String(formData.get("purpose") || "chat");

    if (!(file instanceof File)) {
      return jsonError("请选择附件");
    }

    if (file.size > MAX_SIZE) {
      return jsonError("附件大小不能超过 10MB");
    }

    if (!CHAT_ACCEPTED_TYPES.includes(file.type)) {
      return jsonError("仅支持 PDF、DOCX、TXT、MD、PNG、JPG");
    }

    const storagePath = await persistFile(file, "attachments");
    const attachment = await prisma.attachment.create({
      data: {
        userId,
        fileName: file.name,
        mimeType: file.type,
        storagePath,
        fileSize: file.size,
        purpose,
      },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "上传附件失败", 400);
  }
}