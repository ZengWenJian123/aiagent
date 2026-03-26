import { readFile } from "fs/promises";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const KB_ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

export const CHAT_ACCEPTED_TYPES = [...KB_ACCEPTED_TYPES, "image/png", "image/jpeg"];

export async function extractTextFromFile(filePath: string, mimeType: string) {
  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    return readFile(filePath, "utf8");
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (mimeType === "application/pdf") {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  return "";
}