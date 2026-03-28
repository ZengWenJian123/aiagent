import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取所有用户
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            chatSessions: true,
            modelConfigs: true,
            knowledgeBases: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
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