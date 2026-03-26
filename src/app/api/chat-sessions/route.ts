import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sessionCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const userId = await requireUserId();
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        _count: { select: { messages: true } },
        providerConfig: {
          select: { id: true, label: true, provider: true, model: true, isDefault: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch {
    return jsonError("未授权", 401);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = sessionCreateSchema.parse(await request.json());
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: body.title || "新会话",
        providerConfigId: body.providerConfigId || null,
        systemPrompt:
          body.systemPrompt ||
          "你是一个可靠的 AI Agent 助手，请优先给出清晰、可执行的答案。",
        useContext: body.useContext ?? true,
      },
      include: {
        _count: { select: { messages: true } },
        providerConfig: {
          select: { id: true, label: true, provider: true, model: true, isDefault: true },
        },
      },
    });
    return NextResponse.json(session);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "创建会话失败", 400);
  }
}