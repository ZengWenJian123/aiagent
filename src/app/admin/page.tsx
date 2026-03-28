"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, SectionCard } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import type { ProviderType } from "@/lib/types";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    chatSessions: number;
    modelConfigs: number;
    knowledgeBases: number;
  };
};

type ModelConfig = {
  id: string;
  label: string;
  provider: ProviderType;
  model: string;
  baseUrl: string;
  apiKey: string;
  supportsVision: boolean;
  isDefault: boolean;
  isGlobal: boolean;
  createdAt: string;
};

type Session = {
  id: string;
  title: string;
  createdAt: string;
  _count: { messages: number };
};

type UserDetail = User & {
  modelConfigs: Array<{
    id: string;
    label: string;
    provider: string;
    model: string;
    isGlobal: boolean;
    createdAt: string;
  }>;
  chatSessions: (Session & { user?: { username: string } })[];
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "models" | "users">("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [globalConfigs, setGlobalConfigs] = useState<ModelConfig[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [selectedSession, setSelectedSession] = useState<{
    id: string;
    title: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
    user?: { username: string; email: string };
  } | null>(null);

  const [modelForm, setModelForm] = useState({
    label: "",
    provider: "openai" as ProviderType,
    model: "gpt-4.1-mini",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    supportsVision: false,
    isDefault: false,
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [usersRes, configsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/model-configs"),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setGlobalConfigs(configsData);
      }
    } catch (e) {
      setError("加载数据失败");
    }
  }

  async function saveModelConfig() {
    try {
      const res = await fetch("/api/admin/model-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存失败");
      }

      setModelForm({
        label: "",
        provider: "openai",
        model: "gpt-4.1-mini",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "",
        supportsVision: false,
        isDefault: false,
      });
      setStatus("模型配置已保存");
      loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function deleteModelConfig(id: string) {
    try {
      const res = await fetch("/api/admin/model-configs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }

      setStatus("模型配置已删除");
      loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  async function loadUserDetail(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
      }
    } catch (e) {
      setError("加载用户详情失败");
    }
  }

  async function loadSessionDetail(sessionId: string) {
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSession({
          id: data.id,
          title: data.title,
          messages: data.messages,
          user: data.user,
        });
      }
    } catch (e) {
      setError("加载会话详情失败");
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "更新失败");
      }

      setStatus("用户角色已更新");
      loadData();
      if (selectedUser) {
        loadUserDetail(userId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败");
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("确定要删除此用户吗？此操作不可恢复。")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }

      setStatus("用户已删除");
      setSelectedUser(null);
      loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  async function deleteSession(sessionId: string) {
    if (!confirm("确定要删除此会话吗？")) return;

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }

      setStatus("会话已删除");
      setSelectedSession(null);
      if (selectedUser) {
        loadUserDetail(selectedUser.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionCard>
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">管理后台</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">管理员仪表盘</h1>
              </div>
              <Button variant="secondary" onClick={() => router.push("/chat")}>
                返回聊天
              </Button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  activeTab === "overview"
                    ? "bg-cyan-400 text-slate-950 font-semibold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10",
                )}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab("models")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  activeTab === "models"
                    ? "bg-cyan-400 text-slate-950 font-semibold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10",
                )}
              >
                全局模型配置 ({globalConfigs.length})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  activeTab === "users"
                    ? "bg-cyan-400 text-slate-950 font-semibold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10",
                )}
              >
                用户管理 ({users.length})
              </button>
            </div>

            {(status || error) && (
              <div className={cn("mt-3 text-sm", error ? "text-rose-300" : "text-cyan-300")}>
                {status || error}
              </div>
            )}
          </div>

          <div className="p-5">
            {/* 概览标签页 */}
            {activeTab === "overview" && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">总用户数</p>
                  <p className="mt-2 text-3xl font-bold text-white">{users.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">全局模型配置</p>
                  <p className="mt-2 text-3xl font-bold text-white">{globalConfigs.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">管理员账号</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
            )}

            {/* 全局模型配置标签页 */}
            {activeTab === "models" && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">新增全局模型配置</h3>
                  <Input
                    placeholder="配置名称"
                    value={modelForm.label}
                    onChange={(e) => setModelForm({ ...modelForm, label: e.target.value })}
                  />
                  <select
                    value={modelForm.provider}
                    onChange={(e) => setModelForm({ ...modelForm, provider: e.target.value as ProviderType })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="bailian">阿里云百炼</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="compatible">兼容 OpenAI</option>
                  </select>
                  <Input
                    placeholder="模型名称"
                    value={modelForm.model}
                    onChange={(e) => setModelForm({ ...modelForm, model: e.target.value })}
                  />
                  <Input
                    placeholder="Base URL"
                    value={modelForm.baseUrl}
                    onChange={(e) => setModelForm({ ...modelForm, baseUrl: e.target.value })}
                  />
                  <Input
                    placeholder="API Key"
                    type="password"
                    value={modelForm.apiKey}
                    onChange={(e) => setModelForm({ ...modelForm, apiKey: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={modelForm.supportsVision}
                      onChange={(e) => setModelForm({ ...modelForm, supportsVision: e.target.checked })}
                    />
                    支持图片输入
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={modelForm.isDefault}
                      onChange={(e) => setModelForm({ ...modelForm, isDefault: e.target.checked })}
                    />
                    设为默认
                  </label>
                  <Button className="w-full" onClick={saveModelConfig}>
                    保存配置
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">已保存的全局配置</h3>
                  {globalConfigs.length === 0 ? (
                    <p className="text-sm text-slate-400">暂无全局配置</p>
                  ) : (
                    globalConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-white">{config.label}</p>
                            <p className="text-sm text-slate-400">
                              {config.provider} · {config.model}
                            </p>
                            <p className="text-xs text-slate-500">{config.baseUrl}</p>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => deleteModelConfig(config.id)}>
                            删除
                          </Button>
                        </div>
                        {config.isDefault && (
                          <span className="mt-2 inline-block rounded-full bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300">
                            默认配置
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 用户管理标签页 */}
            {activeTab === "users" && (
              <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">用户列表</h3>
                  {users.length === 0 ? (
                    <p className="text-sm text-slate-400">暂无用户</p>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => loadUserDetail(user.id)}
                        className={cn(
                          "w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10",
                          selectedUser?.id === user.id && "border-cyan-300/40 bg-cyan-300/10",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{user.username}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-xs",
                              user.role === "admin"
                                ? "bg-amber-400/20 text-amber-300"
                                : "bg-slate-400/20 text-slate-300",
                            )}
                          >
                            {user.role === "admin" ? "管理员" : "用户"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {user._count.chatSessions} 个会话 ·{" "}
                          {user._count.modelConfigs} 个模型 ·{" "}
                          {user._count.knowledgeBases} 个知识库
                        </p>
                      </button>
                    ))
                  )}
                </div>

                <div className="space-y-4">
                  {selectedUser ? (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-lg font-semibold text-white">用户详情</h3>
                        <div className="mt-3 space-y-2 text-sm">
                          <p className="text-slate-300">
                            <span className="text-slate-500">用户名:</span> {selectedUser.username}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">邮箱:</span> {selectedUser.email}
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">角色:</span>{" "}
                            <select
                              value={selectedUser.role}
                              onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                              className="rounded bg-slate-800 px-2 py-1 text-white"
                            >
                              <option value="user">普通用户</option>
                              <option value="admin">管理员</option>
                            </select>
                          </p>
                          <p className="text-slate-300">
                            <span className="text-slate-500">注册时间:</span>{" "}
                            {formatDate(selectedUser.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          className="mt-3 w-full"
                          onClick={() => deleteUser(selectedUser.id)}
                        >
                          删除用户
                        </Button>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-lg font-semibold text-white">会话记录</h3>
                        {selectedUser.chatSessions.length === 0 ? (
                          <p className="text-sm text-slate-400">暂无会话</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {selectedUser.chatSessions.map((session) => (
                              <button
                                key={session.id}
                                onClick={() => loadSessionDetail(session.id)}
                                className="w-full rounded-xl bg-slate-800/50 p-2 text-left text-sm text-slate-300 transition hover:bg-slate-700/50"
                              >
                                <p className="font-medium text-white">{session.title}</p>
                                <p className="text-xs text-slate-500">
                                  {session._count.messages} 条消息 · {formatDate(session.createdAt)}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-slate-400">
                      选择一个用户查看详情
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 会话详情弹窗 */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <SectionCard className="max-h-[90vh] w-full max-w-4xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedSession.title}</h2>
                  {selectedSession.user && (
                    <p className="text-sm text-slate-400">
                      用户：{selectedSession.user.username} ({selectedSession.user.email})
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => deleteSession(selectedSession.id)}>
                    删除会话
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedSession(null)}>
                    关闭
                  </Button>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-auto p-5">
                {selectedSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "mb-4 rounded-2xl p-4",
                      msg.role === "user" ? "bg-cyan-400/10" : "bg-white/5",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {msg.role === "user" ? "用户" : "助手"}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-200">{msg.content}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </main>
  );
}