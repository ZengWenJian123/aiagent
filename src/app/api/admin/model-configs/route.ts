import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";
import { modelConfigSchema } from "@/lib/schemas";

// GET - 获取所有全局模型配置
export async function GET() {
  try {
    await requireAdmin();

    const configs = await prisma.modelProviderConfig.findMany({
      where: { isGlobal: true },
      orderBy: { createdAt: "desc" },
    });

    // 不返回加密的 API Key
    const sanitized = configs.map((config) => ({
      ...config,
      apiKeyEncrypted: undefined,
      apiKey: config.apiKeyEncrypted ? "••••••••" : "",
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取失败" },
      { status: 400 }
    );
  }
}

// POST - 创建全局模型配置
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const validated = modelConfigSchema.parse(body);

    const config = await prisma.modelProviderConfig.create({
      data: {
        label: validated.label,
        provider: validated.provider,
        model: validated.model,
        baseUrl: validated.baseUrl,
        apiKeyEncrypted: encryptSecret(validated.apiKey),
        supportsVision: validated.supportsVision,
        isGlobal: true,
        isDefault: validated.isDefault || false,
      },
    });

    return NextResponse.json({
      ...config,
      apiKey: "••••••••",
      apiKeyEncrypted: undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 400 }
    );
  }
}

// DELETE - 批量删除全局模型配置
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "请指定要删除的 ID 列表" }, { status: 400 });
    }

    await prisma.modelProviderConfig.deleteMany({
      where: {
        id: { in: ids },
        isGlobal: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 400 }
    );
  }
}