# Orbital Agent Hub

<div align="center">

**通用 AI Agent 聊天 Web 应用**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.2-green?logo=prisma)](https://www.prisma.io)

[🌐 English Version](README.en.md)

</div>

---

## 🌟 预览

### 首页

![首页](./screenshots/home.png)

*现代化深色主题设计，展示应用核心功能*

### 认证页面

![认证页面](./screenshots/auth.png)

*简洁的用户注册和登录界面*

### 聊天工作台

![聊天工作台](./screenshots/chat.png)

*三栏布局：会话管理 | 聊天区域 | 配置中心*

---

## 📖 简介

Orbital Agent Hub 是一个面向通用 AI Agent 场景的 Web 应用，提供从模型接入到知识检索的一体化控制台。

**核心特性：**
- 🔌 统一管理 OpenAI / 百炼 / DeepSeek / 兼容 OpenAI 的模型接口
- 📝 支持账号系统、会话存档、上下文控制、附件上传与聊天导出
- 🧠 轻量 RAG 知识库内建在单机应用中，适合快速搭建本地 Agent 控制台
- 🎨 现代化深色主题 UI，响应式设计

---

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm / yarn / pnpm

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/ZengWenJian123/aiagent.git
cd aiagent

# 安装依赖
npm install

# 配置环境变量（复制 .env 文件并修改配置）
cp .env.example .env

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

### 访问应用

打开浏览器访问：
```
http://localhost:3000
```

---

## 📁 项目结构

```
aiagent/
├── prisma/
│   ├── schema.prisma      # 数据库模式
│   └── dev.db             # SQLite 数据库
├── public/                # 静态资源
├── screenshots/           # 截图
├── src/
│   ├── app/
│   │   ├── api/           # API 路由
│   │   ├── auth/          # 认证页面
│   │   ├── chat/          # 聊天页面
│   │   ├── layout.tsx     # 根布局
│   │   └── page.tsx       # 首页
│   ├── components/
│   │   ├── auth/          # 认证组件
│   │   ├── chat/          # 聊天组件
│   │   └── ui.tsx         # UI 基础组件
│   └── lib/
│       ├── auth.ts        # 认证逻辑
│       ├── providers.ts   # 模型提供商适配
│       ├── rag.ts         # RAG 检索
│       ├── vector.ts      # 向量嵌入
│       ├── documents.ts   # 文档解析
│       ├── schemas.ts     # Zod 验证
│       └── prisma.ts      # 数据库连接
├── .env                   # 环境变量
├── package.json           # 项目配置
└── tsconfig.json          # TypeScript 配置
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 16.2.1, React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS v4 |
| 数据库 | SQLite + Prisma ORM |
| 认证 | JWT + bcryptjs |
| 验证 | Zod |
| AI 集成 | OpenAI API Compatible |

---

## 📋 功能模块

### 1. 用户认证
- 用户注册 / 登录
- JWT Session 管理
- 基于 Cookie 的身份验证

### 2. 模型配置中心
- 支持多厂商模型：
  - OpenAI
  - 阿里云百炼
  - DeepSeek
  - 兼容 OpenAI 协议
- 每个用户可保存多个模型配置
- 支持设置默认模型
- 支持视觉模型（图片输入）

### 3. 聊天工作台
- 多会话管理
- 流式回复
- 上下文控制
- 系统提示词配置
- 消息记录持久化

### 4. 知识库 RAG 系统
- 文档上传：PDF, DOCX, TXT, Markdown
- 文本分块
- 本地向量嵌入（128 维）
- 相似度检索
- 引用来源展示

### 5. 附件系统
- 支持图片上传：PNG, JPG, JPEG
- 多模态模型支持

### 6. 导出功能
- Markdown 格式导出
- JSON 格式导出

---

## 🔧 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | SQLite 数据库路径 | `file:./dev.db` |
| `AUTH_SECRET` | JWT 加密密钥 | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | `http://localhost:3000` |

---

## 📸 界面截图说明

### 首页设计
- 深色渐变背景
- 功能特性卡片展示
- 快速导航按钮

### 聊天界面
- 左侧：会话列表 + 知识库管理
- 中间：聊天对话区域
- 右侧：模型配置中心

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

<div align="center">

**Orbital Agent Hub**

*为你的多模型聊天应用，搭一套真正能落地的前端工作台*

</div>