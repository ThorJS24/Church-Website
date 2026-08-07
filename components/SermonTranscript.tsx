'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function SermonTranscript({ transcript }: { transcript: string }) {
  const [query, setQuery] = useState('');
  const [activeMatch, setActiveMatch] = useState(0);

  const matchCount = useMemo(() => {
    if (!query.trim()) return 0;
    const regex = new RegExp(escapeRegExp(query.trim()), 'gi');
    return (transcript.match(regex) || []).length;
  }, [query, transcript]);

  const parts = useMemo(() => {
    if (!query.trim()) return [{ text: transcript, match: false, index: -1 }];
    const regex = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
    let matchIndex = -1;
    return transcript.split(regex).map((chunk) => {
      const isMatch = chunk.toLowerCase() === query.trim().toLowerCase();
      if (isMatch) matchIndex += 1;
      return { text: chunk, match: isMatch, index: isMatch ? matchIndex : -1 };
    });
  }, [query, transcript]);

  const jump = (direction: 1 | -1) => {
    if (matchCount === 0) return;
    const next = (activeMatch + direction + matchCount) % matchCount;
    setActiveMatch(next);
    document.getElementById(`transcript-match-${next}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 no-print">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveMatch(0); }}
            placeholder="Search this transcript…"
            className="pl-9"
          />
        </div>
        {query.trim() && (
          <div className="flex items-center gap-1 text-body-sm text-foreground-subtle">
            <span>{matchCount > 0 ? `${activeMatch + 1} of ${matchCount}` : 'No matches'}</span>
            <button type="button" onClick={() => jump(-1)} disabled={matchCount === 0} className="rounded p-1 hover:bg-surface-hover disabled:opacity-40">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => jump(1)} disabled={matchCount === 0} className="rounded p-1 hover:bg-surface-hover disabled:opacity-40">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="whitespace-pre-line text-body-md leading-relaxed text-foreground-muted">
        {parts.map((part, i) =>
          part.match ? (
            <mark
              key={i}
              id={`transcript-match-${part.index}`}
              className={part.index === activeMatch ? 'bg-accent-warm text-accent-warm-foreground' : 'bg-warning-subtle text-foreground'}
            >
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </div>
    </div>
  );
}
