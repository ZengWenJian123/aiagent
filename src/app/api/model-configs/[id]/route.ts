import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/crypto";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { modelConfigSchema } from "@/lib/schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const body = modelConfigSchema.partial().parse(await request.json());

    const existing = await prisma.modelProviderConfig.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return jsonError("模型配置不存在", 404);
    }

    if (body.isDefault) {
      await prisma.modelProviderConfig.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.modelProviderConfig.update({
      where: { id },
      data: {
        label: body.label ?? existing.label,
        provider: body.provider ?? existing.provider,
        model: body.model ?? existing.model,
        baseUrl: body.baseUrl ?? existing.baseUrl,
        supportsVision: body.supportsVision ?? existing.supportsVision,
        isDefault: body.isDefault ?? existing.isDefault,
        apiKeyEncrypted: body.apiKey ? encryptSecret(body.apiKey) : existing.apiKeyEncrypted,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "更新失败", 400);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const existing = await prisma.modelProviderConfig.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return jsonError("模型配置不存在", 404);
    }

    await prisma.modelProviderConfig.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("删除失败", 400);
  }
}