"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AttachmentSummary, Citation, ProviderType } from "@/lib/types";
import { Button, Input, SectionCard, Textarea } from "@/components/ui";
import { cn, formatDate, parseJsonSafely } from "@/lib/utils";

type User = {
  id: string;
  username: string;
  email: string;
  role?: string;
};

type ProviderConfig = {
  id: string;
  label: string;
  provider: ProviderType;
  model: string;
  baseUrl: string;
  apiKey: string;
  supportsVision: boolean;
  isDefault: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  systemPrompt: string | null;
  useContext: boolean;
  updatedAt: string;
  providerConfigId: string | null;
  _count?: { messages: number };
};

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  citationsJson: string | null;
  attachmentsJson: string | null;
  createdAt: string;
};

type KnowledgeDocument = {
  id: string;
  fileName: string;
  parseStatus: string;
};

type KnowledgeBase = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  documents: KnowledgeDocument[];
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as T;
  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error || "请求失败";
    throw new Error(message);
  }
  return data;
}

export function ChatApp({ user }: { user: User }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentSummary[]>([]);
  const [message, setMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "你是一个可靠的 AI Agent 助手，请优先给出清晰、可执行的答案。",
  );
  const [useContext, setUseContext] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("准备就绪");

  const [configForm, setConfigForm] = useState({
    label: "",
    provider: "openai" as ProviderType,
    model: "gpt-4.1-mini",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    supportsVision: true,
    isDefault: true,
  });

  const [knowledgeForm, setKnowledgeForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    void loadMessages(selectedSessionId);
  }, [selectedSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function bootstrap() {
    try {
      const [sessionData, configData, kbData] = await Promise.all([
        fetch("/api/chat-sessions").then((response) => readJson<ChatSession[]>(response)),
        fetch("/api/model-configs").then((response) => readJson<ProviderConfig[]>(response)),
        fetch("/api/knowledge-bases").then((response) => readJson<KnowledgeBase[]>(response)),
      ]);

      setSessions(sessionData);
      setConfigs(configData);
      setKnowledgeBases(kbData);

      const defaultConfig = configData.find((item) => item.isDefault) || configData[0];
      if (defaultConfig) {
        setSelectedConfigId(defaultConfig.id);
        setConfigForm((current) => ({
          ...current,
          provider: defaultConfig.provider,
          model: defaultConfig.model,
          baseUrl: defaultConfig.baseUrl,
          supportsVision: defaultConfig.supportsVision,
        }));
      }

      if (sessionData[0]) {
        setSelectedSessionId(sessionData[0].id);
        setSystemPrompt(sessionData[0].systemPrompt || systemPrompt);
        setUseContext(sessionData[0].useContext);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "加载失败");
    }
  }

  async function loadMessages(sessionId: string) {
    const currentSession = sessions.find((item) => item.id === sessionId);
    if (currentSession) {
      setSystemPrompt(currentSession.systemPrompt || systemPrompt);
      setUseContext(currentSession.useContext);
      if (currentSession.providerConfigId) {
        setSelectedConfigId(currentSession.providerConfigId);
      }
    }

    try {
      const data = await fetch(`/api/chat-sessions/${sessionId}/messages`).then((response) =>
        readJson<ChatMessage[]>(response),
      );
      setMessages(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "消息加载失败");
    }
  }

  async function createSession() {
    try {
      const created = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerConfigId: selectedConfigId || undefined,
          systemPrompt,
          useContext,
        }),
      }).then((response) => readJson<ChatSession>(response));

      setSessions((current) => [created, ...current]);
      setSelectedSessionId(created.id);
      setMessages([]);
      setStatus("已创建新会话");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "创建会话失败");
    }
  }

  async function saveConfig() {
    try {
      const created = await fetch("/api/model-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm),
      }).then((response) => readJson<ProviderConfig>(response));

      await bootstrap();
      setSelectedConfigId(created.id);
      setConfigForm({
        label: "",
        provider: "openai",
        model: "gpt-4.1-mini",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "",
        supportsVision: true,
        isDefault: false,
      });
      setStatus("模型配置已保存");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "保存模型配置失败");
    }
  }

  async function createKnowledgeBase() {
    try {
      await fetch("/api/knowledge-bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(knowledgeForm),
      }).then((response) => readJson<KnowledgeBase>(response));
      setKnowledgeForm({ name: "", description: "" });
      const items = await fetch("/api/knowledge-bases").then((response) =>
        readJson<KnowledgeBase[]>(response),
      );
      setKnowledgeBases(items);
      setStatus("知识库已创建");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "创建知识库失败");
    }
  }

  async function uploadKnowledgeDocument(baseId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`/api/knowledge-bases/${baseId}/documents`, {
        method: "POST",
        body: formData,
      }).then((response) => readJson(response));
      const items = await fetch("/api/knowledge-bases").then((response) =>
        readJson<KnowledgeBase[]>(response),
      );
      setKnowledgeBases(items);
      setStatus(`已处理知识库文档：${file.name}`);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "知识库上传失败");
    }
  }

  async function uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "chat");

    try {
      const item = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      }).then((response) => readJson<AttachmentSummary>(response));
      setAttachments((current) => [...current, item]);
      setStatus(`附件已上传：${file.name}`);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "附件上传失败");
    }
  }

  async function sendMessage() {
    if (!selectedSessionId) {
      await createSession();
      return;
    }

    if (!selectedConfigId || !message.trim()) return;

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: message,
      citationsJson: null,
      attachmentsJson: attachments.length ? JSON.stringify(attachments) : null,
      createdAt: new Date().toISOString(),
    };

    const assistantPlaceholder: ChatMessage = {
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      citationsJson: null,
      attachmentsJson: null,
      createdAt: new Date().toISOString(),
    };

    const outgoingMessage = message;
    setPending(true);
    setError("");
    setMessage("");
    setMessages((current) => [...current, userMessage, assistantPlaceholder]);

    try {
      const response = await fetch("/api/chat-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          providerConfigId: selectedConfigId,
          message: outgoingMessage,
          attachmentIds: attachments.map((item) => item.id),
          knowledgeBaseIds: selectedKnowledgeBaseIds,
          useContext,
          systemPrompt,
        }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "发送消息失败");
      }

      const citations = parseJsonSafely<Citation[]>(
        decodeURIComponent(response.headers.get("X-Citations") || "[]"),
        [],
      );
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = "";

      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (!chunk.value) continue;
        const piece = decoder.decode(chunk.value, { stream: true });
        fullText += piece;
        setMessages((current) => {
          const next = [...current];
          const target = next[next.length - 1];
          if (target) {
            target.content = fullText;
            target.citationsJson = JSON.stringify(citations);
          }
          return next;
        });
      }

      setAttachments([]);
      setStatus("模型回复完成");
      const updatedSessions = await fetch("/api/chat-sessions").then((res) =>
        readJson<ChatSession[]>(res),
      );
      setSessions(updatedSessions);
      await loadMessages(selectedSessionId);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "发送消息失败");
      setMessages((current) => current.slice(0, -1));
    } finally {
      setPending(false);
    }
  }

  async function exportSession(format: "md" | "json") {
    if (!selectedSessionId) return;
    window.open(`/api/exports/${selectedSessionId}?format=${format}`, "_blank");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
    router.refresh();
  }

  const selectedConfig = configs.find((item) => item.id === selectedConfigId);

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1700px] gap-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        <SectionCard className="hidden overflow-hidden lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">会话区</p>
            <h2 className="mt-3 text-xl font-semibold text-white">你好，{user.username}</h2>
            <p className="mt-2 text-sm text-slate-400">管理聊天会话与知识库文档</p>
          </div>

          <div className="flex items-center gap-2 p-4">
            <Button className="flex-1" onClick={createSession}>新建会话</Button>
            <Button variant="secondary" className="flex-1" onClick={logout}>退出登录</Button>
          </div>

          <div className="max-h-[38vh] overflow-auto px-4 pb-4">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">聊天记录</p>
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    selectedSessionId === session.id
                      ? "border-cyan-300/40 bg-cyan-300/10"
                      : "border-white/8 bg-white/3 hover:bg-white/6",
                  )}
                >
                  <p className="font-medium text-white">{session.title}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {session._count?.messages || 0} 条消息 · {formatDate(session.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-4">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">知识库</p>
            <div className="space-y-3">
              {knowledgeBases.map((base) => (
                <div key={base.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{base.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{base.description || "无描述"}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedKnowledgeBaseIds.includes(base.id)}
                      onChange={(event) => {
                        setSelectedKnowledgeBaseIds((current) =>
                          event.target.checked
                            ? [...current, base.id]
                            : current.filter((item) => item !== base.id),
                        );
                      }}
                    />
                  </div>
                  <label className="mt-3 block cursor-pointer rounded-2xl border border-dashed border-white/15 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">
                    上传文档
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadKnowledgeDocument(base.id, file);
                      }}
                    />
                  </label>
                  <div className="mt-3 space-y-2">
                    {base.documents.slice(0, 3).map((document) => (
                      <div key={document.id} className="rounded-xl bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                        <p>{document.fileName}</p>
                        <p className="mt-1 text-slate-500">{document.parseStatus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard className="flex min-h-[80vh] flex-1 flex-col overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">聊天工作台</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  {sessions.find((item) => item.id === selectedSessionId)?.title || "选择会话开始聊天"}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => exportSession("md")}>导出 Markdown</Button>
                <Button variant="secondary" onClick={() => exportSession("json")}>导出 JSON</Button>
                {user.role === "admin" && (
                  <Button onClick={() => router.push("/admin")}>管理后台</Button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useContext}
                  onChange={(event) => setUseContext(event.target.checked)}
                />
                开启上下文
              </label>
              <span>当前模型：{selectedConfig ? `${selectedConfig.label} / ${selectedConfig.model}` : "未设置"}</span>
              <span>状态：{status}</span>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-auto px-5 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-8 text-center text-slate-400">
                创建或选择一个会话，然后配置模型并开始提问。
              </div>
            ) : null}

            {messages.map((item) => {
              const citations = parseJsonSafely<Citation[]>(item.citationsJson, []);
              const fileList = parseJsonSafely<AttachmentSummary[]>(item.attachmentsJson, []);

              return (
                <article key={item.id} className={cn("rounded-3xl p-4 sm:p-5", item.role === "user" ? "ml-auto max-w-3xl bg-cyan-400/12" : "mr-auto max-w-4xl bg-white/6")}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.role === "user" ? "用户" : "助手"}</p>
                    <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{item.content || "正在生成..."}</div>
                  {fileList.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {fileList.map((file) => (
                        <span key={file.id} className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300">
                          附件 · {file.fileName}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {citations.length ? (
                    <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-amber-100/80">参考资料</p>
                      <div className="mt-3 space-y-3">
                        {citations.map((citation) => (
                          <div key={citation.chunkId} className="rounded-2xl bg-black/20 p-3 text-sm text-slate-200">
                            <p className="font-medium text-white">{citation.documentName}</p>
                            <p className="mt-2 line-clamp-4 text-slate-300">{citation.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="border-t border-white/10 px-5 py-4 sm:px-6">
            <Textarea
              rows={4}
              placeholder="输入你的问题、任务描述或 Agent 指令..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-3">
                <Textarea
                  rows={3}
                  placeholder="系统提示词"
                  value={systemPrompt}
                  onChange={(event) => setSystemPrompt(event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {attachments.map((item) => (
                    <span key={item.id} className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300">
                      {item.fileName}
                    </span>
                  ))}
                </div>
                <label className="inline-flex cursor-pointer rounded-2xl border border-dashed border-white/15 px-4 py-3 text-sm text-slate-200 hover:bg-white/5">
                  上传附件
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadAttachment(file);
                    }}
                  />
                </label>
              </div>
              <Button className="h-12 px-6" onClick={sendMessage} disabled={pending || !selectedConfigId}>
                {pending ? "生成中..." : "发送消息"}
              </Button>
            </div>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </div>
        </SectionCard>

        <SectionCard className="hidden overflow-auto lg:block">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">模型与控制</p>
            <h2 className="mt-3 text-xl font-semibold text-white">配置中心</h2>
            <p className="mt-2 text-sm text-slate-400">保存模型 API，切换默认模型，维护知识库。</p>
          </div>

          <div className="space-y-6 p-5">
            <section className="space-y-3 rounded-3xl border border-white/10 bg-white/4 p-4">
              <h3 className="text-base font-semibold text-white">已保存模型</h3>
              <select
                value={selectedConfigId}
                onChange={(event) => setSelectedConfigId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white"
              >
                <option value="">请选择模型配置</option>
                {configs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.label} / {config.model}
                  </option>
                ))}
              </select>
              <div className="space-y-2">
                {configs.map((config) => (
                  <div key={config.id} className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{config.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{config.provider} · {config.baseUrl}</p>
                      </div>
                      {(config as any).isGlobal && (
                        <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300">
                          全局
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{config.isDefault ? "默认配置" : "可切换"}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-3xl border border-white/10 bg-white/4 p-4">
              <h3 className="text-base font-semibold text-white">新增模型配置</h3>
              <Input
                placeholder="配置名称，例如 OpenAI 主账号"
                value={configForm.label}
                onChange={(event) => setConfigForm((current) => ({ ...current, label: event.target.value }))}
              />
              <select
                value={configForm.provider}
                onChange={(event) => setConfigForm((current) => ({ ...current, provider: event.target.value as ProviderType }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white"
              >
                <option value="openai">OpenAI</option>
                <option value="bailian">阿里云百炼</option>
                <option value="deepseek">DeepSeek</option>
                <option value="compatible">兼容 OpenAI</option>
              </select>
              <Input
                placeholder="模型名称"
                value={configForm.model}
                onChange={(event) => setConfigForm((current) => ({ ...current, model: event.target.value }))}
              />
              <Input
                placeholder="Base URL"
                value={configForm.baseUrl}
                onChange={(event) => setConfigForm((current) => ({ ...current, baseUrl: event.target.value }))}
              />
              <Input
                placeholder="API Key"
                type="password"
                value={configForm.apiKey}
                onChange={(event) => setConfigForm((current) => ({ ...current, apiKey: event.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={configForm.supportsVision}
                  onChange={(event) =>
                    setConfigForm((current) => ({ ...current, supportsVision: event.target.checked }))
                  }
                />
                支持图片输入
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={configForm.isDefault}
                  onChange={(event) =>
                    setConfigForm((current) => ({ ...current, isDefault: event.target.checked }))
                  }
                />
                保存为默认模型
              </label>
              <Button className="w-full" onClick={saveConfig}>保存模型配置</Button>
            </section>

            <section className="space-y-3 rounded-3xl border border-white/10 bg-white/4 p-4">
              <h3 className="text-base font-semibold text-white">新建知识库</h3>
              <Input
                placeholder="知识库名称"
                value={knowledgeForm.name}
                onChange={(event) =>
                  setKnowledgeForm((current) => ({ ...current, name: event.target.value }))
                }
              />
              <Textarea
                rows={3}
                placeholder="知识库描述"
                value={knowledgeForm.description}
                onChange={(event) =>
                  setKnowledgeForm((current) => ({ ...current, description: event.target.value }))
                }
              />
              <Button className="w-full" onClick={createKnowledgeBase}>创建知识库</Button>
            </section>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}