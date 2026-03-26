import { NextResponse } from "next/server";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { modelConfigSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const userId = await requireUserId();
    const configs = await prisma.modelProviderConfig.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json(
      configs.map((config) => ({
        id: config.id,
        label: config.label,
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        apiKey: decryptSecret(config.apiKeyEncrypted),
        supportsVision: config.supportsVision,
        isDefault: config.isDefault,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      })),
    );
  } catch {
    return jsonError("未授权", 401);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = modelConfigSchema.parse(await request.json());

    if (body.isDefault) {
      await prisma.modelProviderConfig.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const created = await prisma.modelProviderConfig.create({
      data: {
        userId,
        label: body.label,
        provider: body.provider,
        model: body.model,
        baseUrl: body.baseUrl,
        apiKeyEncrypted: encryptSecret(body.apiKey),
        supportsVision: body.supportsVision,
        isDefault: Boolean(body.isDefault),
      },
    });

    return NextResponse.json({
      ...created,
      apiKey: body.apiKey,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "保存模型配置失败", 400);
  }
}