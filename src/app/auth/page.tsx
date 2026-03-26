import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/chat");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.14),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.1),transparent_18%)]" />
      <div className="relative grid w-full max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <section className="relative z-10 max-w-2xl space-y-6">
          <p className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            登录后进入你的 AI Agent 中枢
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white">
            把模型接入、会话、知识库和附件协作，统一放进一个工作台。
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            支持 OpenAI、阿里云百炼、DeepSeek 等主流模型配置；提供上下文、多轮对话、轻量 RAG、会话导出与本地 SQLite 存档能力。
          </p>
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
          >
            返回介绍页
          </Link>
        </section>
        <div className="relative z-20"><AuthForm /></div>
      </div>
    </main>
  );
}