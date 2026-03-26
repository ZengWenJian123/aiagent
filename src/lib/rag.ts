import { prisma } from "@/lib/prisma";
import { createEmbedding, similarity, splitIntoChunks } from "@/lib/vector";
import { extractTextFromFile } from "@/lib/documents";
import type { Citation } from "@/lib/types";

export async function indexKnowledgeDocument(
  documentId: string,
  filePath: string,
  mimeType: string,
) {
  const text = await extractTextFromFile(filePath, mimeType);
  const chunks = splitIntoChunks(text);

  await prisma.documentChunk.deleteMany({
    where: { documentId },
  });

  if (chunks.length === 0) {
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { parseStatus: "EMPTY" },
    });
    return;
  }

  await prisma.documentChunk.createMany({
    data: chunks.map((content, index) => ({
      documentId,
      chunkIndex: index,
      content,
      embedding: JSON.stringify(createEmbedding(content)),
    })),
  });

  await prisma.knowledgeDocument.update({
    where: { id: documentId },
    data: { parseStatus: "READY" },
  });
}

export async function retrieveCitations(
  userId: string,
  knowledgeBaseIds: string[],
  question: string,
) {
  if (knowledgeBaseIds.length === 0) return [] as Citation[];

  const documents = await prisma.knowledgeDocument.findMany({
    where: {
      knowledgeBaseId: { in: knowledgeBaseIds },
      knowledgeBase: { userId },
      parseStatus: "READY",
    },
    include: { chunks: true },
  });

  const queryVector = createEmbedding(question);

  return documents
    .flatMap((document) =>
      document.chunks.map((chunk) => ({
        documentId: document.id,
        documentName: document.fileName,
        chunkId: chunk.id,
        content: chunk.content,
        score: similarity(queryVector, JSON.parse(chunk.embedding) as number[]),
      })),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}