// shadcn-generated components import `cn` from here by convention. The
// real implementation lives in lib/cn.ts (used by hundreds of existing
// call sites) and includes a custom tailwind-merge class-group fix for
// this app's named font-size scale (text-body-sm, text-caption, etc.) —
// re-exporting keeps both import paths pointed at the same, fixed cn().
export { cn } from './cn';

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
