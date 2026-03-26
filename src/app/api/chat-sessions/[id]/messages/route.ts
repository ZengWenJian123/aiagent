import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const session = await prisma.chatSession.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!session) {
      return jsonError("会话不存在", 404);
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch {
    return jsonError("获取消息失败", 400);
  }
}