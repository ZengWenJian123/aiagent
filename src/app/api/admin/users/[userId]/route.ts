import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// GET - 获取指定用户详情
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        modelConfigs: {
          select: {
            id: true,
            label: true,
            provider: true,
            model: true,
            isGlobal: true,
            createdAt: true,
          },
        },
        chatSessions: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(user);
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

// PUT - 更新用户角色
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 400 }
    );
  }
}

// DELETE - 删除用户
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { userId } = await params;

    await prisma.user.delete({
      where: { id: userId },
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