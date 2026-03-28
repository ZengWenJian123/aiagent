/**
 * 将指定用户设置为管理员
 * 使用方法：npx tsx scripts/create-admin.ts <username>
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.log("用法：npx tsx scripts/create-admin.ts <用户名>");
    console.log("示例：npx tsx scripts/create-admin.ts admin");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log(`❌ 用户 "${username}" 不存在`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`✅ 用户 "${username}" 已经是管理员`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    console.log(`✅ 用户 "${username}" 已设置为管理员`);
  } catch (error) {
    console.error("❌ 错误:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();