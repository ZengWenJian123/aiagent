import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(24),
  email: z.email(),
  password: z.string().min(8).max(64),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
});

export const modelConfigSchema = z.object({
  label: z.string().trim().min(1).max(40),
  provider: z.enum(["openai", "bailian", "deepseek", "compatible"]),
  model: z.string().trim().min(1).max(80),
  baseUrl: z.url(),
  apiKey: z.string().trim().min(8),
  supportsVision: z.boolean().default(false),
  isDefault: z.boolean().optional(),
});

export const sessionCreateSchema = z.object({
  title: z.string().trim().optional(),
  providerConfigId: z.string().trim().optional(),
  systemPrompt: z.string().trim().optional(),
  useContext: z.boolean().optional(),
});

export const sessionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(50).optional(),
  providerConfigId: z.string().trim().nullable().optional(),
  systemPrompt: z.string().trim().nullable().optional(),
  useContext: z.boolean().optional(),
});

export const knowledgeBaseSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(240).optional(),
});

export const chatSendSchema = z.object({
  sessionId: z.string().trim().min(1),
  providerConfigId: z.string().trim().min(1),
  message: z.string().trim().min(1),
  knowledgeBaseIds: z.array(z.string()).default([]),
  attachmentIds: z.array(z.string()).default([]),
  useContext: z.boolean(),
  systemPrompt: z.string().trim().optional(),
});