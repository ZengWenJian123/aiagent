export type ProviderType = "openai" | "bailian" | "deepseek" | "compatible";

export type AttachmentSummary = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  purpose: string;
  storagePath?: string;
};

export type Citation = {
  documentId: string;
  documentName: string;
  chunkId: string;
  content: string;
  score: number;
};

export type ModelConfigInput = {
  label: string;
  provider: ProviderType;
  model: string;
  baseUrl: string;
  apiKey: string;
  supportsVision: boolean;
  isDefault?: boolean;
};

export type ChatSendBody = {
  sessionId: string;
  providerConfigId: string;
  message: string;
  knowledgeBaseIds: string[];
  attachmentIds: string[];
  useContext: boolean;
  systemPrompt?: string;
};

