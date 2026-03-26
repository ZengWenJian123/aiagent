import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { knowledgeBaseSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const userId = await requireUserId();
    const items = await prisma.knowledgeBase.findMany({
      where: { userId },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch {
    return jsonError("未授权", 401);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = knowledgeBaseSchema.parse(await request.json());
    const item = await prisma.knowledgeBase.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "创建知识库失败", 400);
  }
}