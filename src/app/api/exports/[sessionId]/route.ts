import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { parseJsonSafely } from "@/lib/utils";

type Context = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { sessionId } = await context.params;
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "md";
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        providerConfig: {
          select: { label: true, provider: true, model: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return jsonError("会话不存在", 404);
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { exportedAt: new Date() },
    });

    if (format === "json") {
      return new NextResponse(JSON.stringify(session, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(`${session.title}.json`)}"`,
        },
      });
    }

    const markdown = [
      `# ${session.title}`,
      "",
      `- 模型：${session.providerConfig?.label || "未设置"} / ${session.providerConfig?.model || "未知"}`,
      `- 厂商：${session.providerConfig?.provider || "未知"}`,
      "",
      ...session.messages.flatMap((message) => {
        const citations = parseJsonSafely<
          Array<{ documentName: string; content: string; score: number }>
        >(message.citationsJson, []);
        return [
          `## ${message.role === "user" ? "用户" : "助手"} · ${new Date(message.createdAt).toLocaleString("zh-CN")}`,
          "",
          message.content,
          "",
          ...(citations.length
            ? [
                "### 参考资料",
                "",
                ...citations.map(
                  (item) => `- ${item.documentName} (${item.score.toFixed(3)}): ${item.content}`,
                ),
                "",
              ]
            : []),
        ];
      }),
    ].join("\n");

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(`${session.title}.md`)}"`,
      },
    });
  } catch {
    return jsonError("导出失败", 400);
  }
}