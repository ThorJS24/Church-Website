export interface ContentBlock {
  type: 'heading' | 'paragraph';
  text: string;
  id?: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Blog content is stored as plain text (no markdown/rich-text), so there's
 * no real heading markup to build a table of contents from. As a heuristic,
 * a short line (under ~70 chars) that doesn't end in sentence punctuation
 * reads as a section heading in practice for how this church's posts are
 * written — long enough to be useful, conservative enough to rarely
 * misfire on an actual short paragraph.
 */
export function parseBlogContent(content: string): ContentBlock[] {
  const paragraphs = content.split('\n').map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((text) => {
    const looksLikeHeading = text.length > 0 && text.length <= 70 && !/[.!?]$/.test(text);
    if (looksLikeHeading) {
      return { type: 'heading' as const, text, id: slugify(text) };
    }
    return { type: 'paragraph' as const, text };
  });
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
