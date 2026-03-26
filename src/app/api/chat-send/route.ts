import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { buildVendorMessages, streamChatCompletion } from "@/lib/providers";
import { retrieveCitations } from "@/lib/rag";
import { chatSendSchema } from "@/lib/schemas";
import { pickSessionTitle } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = chatSendSchema.parse(await request.json());
    const session = await prisma.chatSession.findFirst({
      where: { id: body.sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: body.useContext ? 16 : 0,
        },
      },
    });

    if (!session) {
      return jsonError("会话不存在", 404);
    }

    const providerConfig = await prisma.modelProviderConfig.findFirst({
      where: { id: body.providerConfigId, userId },
    });

    if (!providerConfig) {
      return jsonError("模型配置不存在", 404);
    }

    const attachments = await prisma.attachment.findMany({
      where: {
        id: { in: body.attachmentIds },
        userId,
      },
    });

    const citations = await retrieveCitations(userId, body.knowledgeBaseIds, body.message);

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: body.message,
        citationsJson: citations.length ? JSON.stringify(citations) : null,
        attachmentsJson: attachments.length ? JSON.stringify(attachments) : null,
      },
    });

    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        title: session.title === "新会话" ? pickSessionTitle(body.message) : session.title,
        providerConfigId: providerConfig.id,
        systemPrompt: body.systemPrompt || session.systemPrompt,
        useContext: body.useContext,
      },
    });

    const history = body.useContext
      ? session.messages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      : [];

    const vendorMessages = await buildVendorMessages({
      systemPrompt: body.systemPrompt || session.systemPrompt,
      history,
      message: body.message,
      attachments,
      citations,
    });

    const bodyStream = await streamChatCompletion({
      provider: providerConfig.provider,
      baseUrl: providerConfig.baseUrl,
      model: providerConfig.model,
      apiKeyEncrypted: providerConfig.apiKeyEncrypted,
      messages: vendorMessages,
    });

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const reader = bodyStream.getReader();
    let buffer = "";
    let assistantText = "";

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n");
            buffer = parts.pop() || "";

            for (const line of parts) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;

              try {
                const json = JSON.parse(payload) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const chunk = json.choices?.[0]?.delta?.content || "";
                if (!chunk) continue;
                assistantText += chunk;
                controller.enqueue(encoder.encode(chunk));
              } catch {
                continue;
              }
            }
          }

          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: "assistant",
              content: assistantText || "模型没有返回文本内容。",
              citationsJson: citations.length ? JSON.stringify(citations) : null,
            },
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Citations": encodeURIComponent(JSON.stringify(citations)),
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "发送消息失败", 400);
  }
}