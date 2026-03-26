const DIMENSIONS = 128;

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function createEmbedding(input: string) {
  const vector = new Array<number>(DIMENSIONS).fill(0);

  for (const token of tokenize(input)) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    vector[Math.abs(hash) % DIMENSIONS] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function similarity(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + value * (b[index] || 0), 0);
}

export function splitIntoChunks(content: string, size = 600) {
  const cleaned = content.replace(/\r/g, "").trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of cleaned.split(/\n{2,}/)) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > size && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

