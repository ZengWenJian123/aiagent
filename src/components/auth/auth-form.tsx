"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, SectionCard } from "@/components/ui";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { email, password }
        : { username, email, password };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "请求失败，请重试");
      setPending(false);
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <SectionCard className="w-full max-w-md border-white/12 p-8">
      <div className="mb-8 flex rounded-2xl bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-2xl px-4 py-2 text-sm transition ${
            mode === "login" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
          }`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-2xl px-4 py-2 text-sm transition ${
            mode === "register" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
          }`}
        >
          注册
        </button>
      </div>

      <div className="space-y-4">
        {mode === "register" ? (
          <Input
            placeholder="用户名"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        ) : null}
        <Input
          placeholder="邮箱"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          placeholder="密码（至少 8 位）"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "提交中..." : mode === "login" ? "进入工作台" : "创建账户"}
        </Button>
      </div>
    </SectionCard>
  );
}