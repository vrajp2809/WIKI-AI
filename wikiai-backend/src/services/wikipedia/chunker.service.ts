export class ChunkerService {
  /**
   * Split text into overlapping chunks by approximate token count.
   * Rule of thumb: 1 token ≈ 4 characters.
   */
  chunk(text: string, targetTokens = 500, overlapTokens = 50): string[] {
    const targetChars = targetTokens * 4;
    const overlapChars = overlapTokens * 4;

    if (text.length <= targetChars) return [text];

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + targetChars;

      if (end < text.length) {
        // Try to break at a sentence boundary
        const nearEnd = text.lastIndexOf('. ', end);
        if (nearEnd > start + targetChars * 0.5) {
          end = nearEnd + 1;
        }
      }

      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) chunks.push(chunk);

      start = end - overlapChars;
    }

    return chunks;
  }
}
