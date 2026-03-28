import { NextResponse } from "next/server";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { requireUserId, getCurrentUserWithRole } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { modelConfigSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return jsonError("未授权", 401);
    }

    // 获取用户自己的配置
    const userConfigs = await prisma.modelProviderConfig.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    // 获取全局配置（管理员创建的）
    const globalConfigs = await prisma.modelProviderConfig.findMany({
      where: { isGlobal: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    // 合并配置，全局配置显示解密后的 API Key 占位符
    const userConfigsWithApiKey = userConfigs.map((config) => ({
      id: config.id,
      label: config.label,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      apiKey: decryptSecret(config.apiKeyEncrypted),
      supportsVision: config.supportsVision,
      isDefault: config.isDefault,
      isGlobal: false,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));

    const globalConfigsWithPlaceholder = globalConfigs.map((config) => ({
      id: config.id,
      label: config.label,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      apiKey: "••••••••",
      supportsVision: config.supportsVision,
      isDefault: config.isDefault,
      isGlobal: true,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));

    return NextResponse.json([...userConfigsWithApiKey, ...globalConfigsWithPlaceholder]);
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