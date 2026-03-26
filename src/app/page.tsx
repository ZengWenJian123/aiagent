import Link from "next/link";

const highlights = [
  "统一管理 OpenAI / 百炼 / DeepSeek / 兼容 OpenAI 的模型接口",
  "支持账号系统、会话存档、上下文控制、附件上传与聊天导出",
  "轻量 RAG 知识库内建在单机应用中，适合快速搭建本地 Agent 控制台",
];

const features = [
  {
    title: "模型配置中心",
    body: "保存不同厂商的 API Key、Base URL 和默认模型，按用户隔离存储。",
  },
  {
    title: "聊天工作台",
    body: "多会话、多模型切换，支持系统提示词、上下文开关和流式回复。",
  },
  {
    title: "知识库与附件",
    body: "上传 PDF、DOCX、TXT、Markdown、PNG、JPG，兼顾 RAG 与多模态输入。",
  },
  {
    title: "本地数据留存",
    body: "SQLite 保存账户、消息、模型配置、知识库文档与导出记录。",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        <header className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Orbital Agent Hub</p>
            <p className="mt-2 text-sm text-slate-400">通用 AI Agent 聊天 Web 应用</p>
          </div>
          <div className="flex gap-3">
            <Link href="/auth" className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">
              登录 / 注册
            </Link>
            <Link href="/chat" className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              进入聊天页
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-10 pb-16 pt-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
              从模型接入到知识检索的一体化 AI Agent 控制台
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              为你的多模型聊天应用，搭一套真正能落地的前端工作台。
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
              这个应用面向通用 AI Agent 场景设计，提供三页式体验：应用介绍页、登录注册页和聊天页面。你可以接入主流厂商 API、维护会话上下文、挂接知识库文档、上传附件并导出结果。
            </p>
            <div className="mt-8 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 text-slate-200">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.5)] backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">Feature</p>
                  <h2 className="mt-4 text-xl font-semibold text-white">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}