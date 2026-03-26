import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const rootStorage = path.join(process.cwd(), "storage");

export async function ensureStorageDir(kind: "attachments" | "knowledge") {
  const directory = path.join(rootStorage, kind);
  await mkdir(directory, { recursive: true });
  return directory;
}

export async function persistFile(
  file: File,
  kind: "attachments" | "knowledge",
) {
  const directory = await ensureStorageDir(kind);
  const extension = path.extname(file.name) || "";
  const uniqueName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(directory, uniqueName);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));
  return filePath;
}

