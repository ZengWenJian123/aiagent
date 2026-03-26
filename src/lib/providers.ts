import { readFile } from "fs/promises";
import { decryptSecret } from "@/lib/crypto";
import type { AttachmentSummary, Citation } from "@/lib/types";

type VendorMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

export function defaultBaseUrl(provider: string) {
  if (provider === "openai") return "https://api.openai.com/v1";
  if (provider === "deepseek") return "https://api.deepseek.com/v1";
  if (provider === "bailian") {
    return "https://dashscope.aliyuncs.com/compatible-mode/v1";
  }
  return "https://api.openai.com/v1";
}

export async function buildVendorMessages(params: {
  systemPrompt?: string | null;
  history: Array<{ role: string; content: string }>;
  message: string;
  attachments: AttachmentSummary[];
  citations: Citation[];
}) {
  const messages: VendorMessage[] = [];

  if (params.systemPrompt?.trim()) {
    messages.push({
      role: "system",
      content: params.systemPrompt,
    });
  }

  if (params.citations.length > 0) {
    const contextText = params.citations
      .map(
        (citation, index) =>
          `[资料 ${index + 1}] ${citation.documentName}\n${citation.content}`,
      )
      .join("\n\n");

    messages.push({
      role: "system",
      content: `请结合以下知识库内容作答；如果资料不足请明确说明。\n\n${contextText}`,
    });
  }

  for (const item of params.history) {
    messages.push({
      role: item.role as VendorMessage["role"],
      content: item.content,
    });
  }

  const content: VendorMessage["content"] = [{ type: "text", text: params.message }];

  for (const attachment of params.attachments) {
    if (!attachment.mimeType.startsWith("image/") || !attachment.storagePath) continue;
    const fileBuffer = await readFile(attachment.storagePath);
    const base64 = fileBuffer.toString("base64");
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${attachment.mimeType};base64,${base64}`,
      },
    });
  }

  messages.push({
    role: "user",
    content,
  });

  return messages;
}

export async function streamChatCompletion(params: {
  provider: string;
  baseUrl: string;
  model: string;
  apiKeyEncrypted: string;
  messages: VendorMessage[];
}) {
  const apiKey = decryptSecret(params.apiKeyEncrypted);
  const response = await fetch(`${params.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      stream: true,
      messages: params.messages,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(errorText || "模型服务请求失败");
  }

  return response.body;
}

